import type { ArticleBlock, Inline } from "@/content/types"

export interface RichNode {
  type: string
  text?: string
  format?: number | string
  tag?: string
  children?: RichNode[]
  fields?: Record<string, unknown>
  relationTo?: string
  value?: unknown
  [key: string]: unknown
}

export interface RichDocument {
  root: RichNode & { children: RichNode[] }
}

export interface ContentHeading {
  id: string
  text: string
  level: 2 | 3
}
export interface LegacyAnchor {
  text: string
  occurrence: number
  anchor: string
}

export function safeContentLink(
  value: unknown,
  externalOnly = false,
): string | null {
  if (typeof value !== "string" || /[\u0000-\u0020\\]/.test(value)) return null
  if (!externalOnly && /^\/(?!\/)/.test(value)) return value
  if (!externalOnly && /^#[^\s]+$/.test(value)) return value
  try {
    const url = new URL(value)
    return url.protocol === "https:" && !url.username && !url.password
      ? value
      : null
  } catch {
    return null
  }
}

export function nodeText(node: RichNode): string {
  if (typeof node.text === "string") return node.text
  if (node.type === "block" && typeof node.fields?.code === "string")
    return node.fields.code
  return (node.children ?? [])
    .map(nodeText)
    .join(node.type === "root" ? "\n" : "")
}

export function lexicalPlainText(document: unknown) {
  if (!document || typeof document !== "object" || !("root" in document))
    return ""
  return nodeText((document as RichDocument).root)
}

export function estimateReadingTime(text: string) {
  const chinese = (text.match(/[\u3400-\u9fff]/g) ?? []).length
  const words = (text.match(/[a-zA-Z0-9]+/g) ?? []).length
  return Math.max(1, Math.ceil(chinese / 280 + words / 200))
}

export function contentHeadings(
  document: RichDocument | null | undefined,
  legacy: LegacyAnchor[] = [],
) {
  const headings: ContentHeading[] = []
  const occurrences = new Map<string, number>()
  const used = new Set<string>()
  const walk = (node: RichNode) => {
    if (node.type === "heading") {
      const text = nodeText(node)
      const occurrence = (occurrences.get(text) ?? 0) + 1
      occurrences.set(text, occurrence)
      const saved = legacy.find(
        (entry) => entry.text === text && entry.occurrence === occurrence,
      )
      const base =
        saved?.anchor ||
        text
          .toLocaleLowerCase()
          .normalize("NFKC")
          .replace(/[^\p{L}\p{N}\s-]/gu, "")
          .trim()
          .replace(/\s+/g, "-") ||
        "section"
      let id = base
      for (let suffix = 2; used.has(id); suffix++) id = `${base}-${suffix}`
      used.add(id)
      headings.push({ id, text, level: node.tag === "h3" ? 3 : 2 })
    }
    for (const child of node.children ?? []) walk(child)
  }
  if (document?.root) walk(document.root)
  return headings
}

export function collectMediaIDs(document: unknown, cover?: unknown) {
  const ids = new Set<string>()
  const add = (value: unknown) => {
    const id =
      value && typeof value === "object" && "id" in value ? value.id : value
    if (typeof id === "string" && id) ids.add(id)
  }
  add(cover)
  const walk = (value: unknown) => {
    if (!value || typeof value !== "object") return
    const node = value as RichNode
    if (node.type === "upload" && node.relationTo === "media") add(node.value)
    for (const child of node.children ?? []) walk(child)
  }
  if (document && typeof document === "object" && "root" in document)
    walk(document.root)
  return [...ids]
}

const element = (
  type: string,
  children: RichNode[],
  extra: Record<string, unknown> = {},
): RichNode => ({
  type,
  children,
  direction: "ltr",
  format: "",
  indent: 0,
  ...extra,
})
const text = (value: string, format = 0): RichNode => ({
  type: "text",
  detail: 0,
  format,
  mode: "normal",
  style: "",
  text: value,
})

export function inlineToLexical(content: Inline[]): RichNode[] {
  return content.map((part) => {
    if (typeof part === "string") return text(part)
    if (part.kind === "code") return text(part.text, 16)
    if (part.kind === "strong") return text(part.text, 1)
    const url = safeContentLink(part.href)
    return url
      ? element("link", [text(part.text)], {
          id: crypto.randomUUID(),
          fields: { linkType: "custom", url, newTab: !url.startsWith("/") },
        })
      : text(part.text)
  })
}

export function blocksToLexical(blocks: ArticleBlock[]): RichDocument {
  const children = blocks.map((block): RichNode => {
    switch (block.kind) {
      case "heading":
        return element("heading", [text(block.text)], {
          tag: `h${block.level}`,
        })
      case "paragraph":
        return element("paragraph", inlineToLexical(block.content), {
          textFormat: 0,
          textStyle: "",
        })
      case "quote":
        return element("quote", inlineToLexical(block.content))
      case "list":
        return element(
          "list",
          block.items.map((item, index) =>
            element("listitem", inlineToLexical(item), { value: index + 1 }),
          ),
          {
            listType: block.ordered ? "number" : "bullet",
            start: 1,
            tag: block.ordered ? "ol" : "ul",
          },
        )
      case "code":
        return {
          type: "block",
          format: "",
          fields: {
            id: crypto.randomUUID(),
            blockType: "Code",
            code: block.code,
            language: block.language === "text" ? "plaintext" : block.language,
          },
        }
      case "table":
        return element(
          "table",
          [block.headers, ...block.rows].map((row, index) =>
            element(
              "tablerow",
              row.map((cell) =>
                element(
                  "tablecell",
                  [
                    element("paragraph", [text(cell)], {
                      textFormat: 0,
                      textStyle: "",
                    }),
                  ],
                  {
                    headerState: index === 0 ? 1 : 0,
                    colSpan: 1,
                    rowSpan: 1,
                    backgroundColor: null,
                  },
                ),
              ),
            ),
          ),
        )
    }
  })
  return { root: element("root", children) as RichDocument["root"] }
}

export function legacyAnchors(blocks: ArticleBlock[]): LegacyAnchor[] {
  const count = new Map<string, number>()
  return blocks.flatMap((block) => {
    if (block.kind !== "heading") return []
    const occurrence = (count.get(block.text) ?? 0) + 1
    count.set(block.text, occurrence)
    return [{ text: block.text, occurrence, anchor: block.id }]
  })
}
