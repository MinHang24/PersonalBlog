import { createElement, type ReactNode } from "react"
import Image from "next/image"
import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react"
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"
import { AppLink, ExternalLink, Typography } from "./ui"
import { CodeSnippet } from "./CodeSnippet"
import {
  nodeText,
  safeContentLink,
  type ContentHeading,
  type RichDocument,
} from "@/lib/content/richtext"

export function RichContent({
  content,
  headings = [],
}: {
  content: RichDocument | null
  headings?: ContentHeading[]
}) {
  if (!content?.root) return null
  let headingIndex = 0
  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    text: ({ node }) => {
      // Keep editorial emphasis, not arbitrary pasted fonts or inline CSS.
      let content: ReactNode = node.text
      if (node.format & 16)
        content = <code className="inline-code">{content}</code>
      if (node.format & 1) content = <strong>{content}</strong>
      if (node.format & 2) content = <em>{content}</em>
      if (node.format & 4) content = <s>{content}</s>
      if (node.format & 8) content = <u>{content}</u>
      if (node.format & 32) content = <sub>{content}</sub>
      if (node.format & 64) content = <sup>{content}</sup>
      return content
    },
    heading: ({ node, nodesToJSX }) => {
      const heading = headings[headingIndex++]
      return createElement(
        node.tag || "h2",
        {
          id: heading?.id,
          className:
            node.tag === "h3"
              ? "type-card prose-heading"
              : "type-section prose-heading",
        },
        nodesToJSX({ nodes: node.children }),
      )
    },
    paragraph: ({ node, nodesToJSX }) => (
      <Typography>{nodesToJSX({ nodes: node.children })}</Typography>
    ),
    link: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      let url = safeContentLink(node.fields.url)
      if (node.fields.linkType === "internal" && node.fields.doc) {
        const doc = node.fields.doc
        const value = typeof doc.value === "object" ? doc.value : null
        if (
          value &&
          "slug" in value &&
          value.slug &&
          ["posts", "projects"].includes(doc.relationTo)
        ) {
          url = `/${
            doc.relationTo === "posts" ? "blog" : "projects"
          }/${value.slug}`
        }
      }
      return url ? (
        url.startsWith("https:") ? (
          <ExternalLink href={url}>{children}</ExternalLink>
        ) : (
          <AppLink to={url}>{children}</AppLink>
        )
      ) : (
        <span>{children}</span>
      )
    },
    autolink: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      const url = safeContentLink(node.fields.url)
      return url ? (
        url.startsWith("https:") ? (
          <ExternalLink href={url}>{children}</ExternalLink>
        ) : (
          <AppLink to={url}>{children}</AppLink>
        )
      ) : (
        <span>{children}</span>
      )
    },
    upload: ({ node }) => {
      const media = typeof node.value === "object" ? node.value : null
      if (
        !media ||
        !("url" in media) ||
        typeof media.url !== "string" ||
        !("width" in media) ||
        !("height" in media) ||
        !media.width ||
        !media.height
      )
        return null
      return (
        <figure className="my-2xl">
          <Image
            src={media.url}
            alt={
              "alt" in media && typeof media.alt === "string" ? media.alt : ""
            }
            width={Number(media.width)}
            height={Number(media.height)}
            sizes="(max-width: 768px) 90vw, 760px"
            className="h-auto w-full rounded-corner-lg"
          />
        </figure>
      )
    },
    blocks: {
      Code: ({ node }) => {
        const fields = node.fields as Record<string, unknown>
        return (
          <CodeSnippet
            code={String(fields.code || "")}
            language={String(fields.language || "text")}
          />
        )
      },
    },
    table: ({ node, nodesToJSX }) => (
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="正文表格"
      >
        <table>
          <tbody>{nodesToJSX({ nodes: node.children })}</tbody>
        </table>
      </div>
    ),
    tablecell: ({ node, nodesToJSX }) =>
      createElement(
        node.headerState ? "th" : "td",
        {
          colSpan: node.colSpan,
          rowSpan: node.rowSpan,
          scope: node.headerState ? "col" : undefined,
        },
        nodesToJSX({ nodes: node.children }),
      ),
    relationship: () => null,
    unknown: ({ node }) => <Typography>{nodeText(node)}</Typography>,
  })
  return (
    <div className="article-prose">
      <RichText
        data={content as unknown as SerializedEditorState}
        converters={converters}
        disableContainer
        disableIndent
        disableTextAlign
      />
    </div>
  )
}
