export type Category = "go" | "rust" | "multimedia" | "desktop"

interface InlineCode {
  kind: "code"
  text: string
}

interface InlineStrong {
  kind: "strong"
  text: string
}

interface InlineLink {
  kind: "link"
  text: string
  href: string
}

export type Inline = string | InlineCode | InlineStrong | InlineLink

interface HeadingBlock {
  kind: "heading"
  level: 2 | 3
  id: string
  text: string
}

interface ParagraphBlock {
  kind: "paragraph"
  content: Inline[]
}

interface ListBlock {
  kind: "list"
  ordered?: boolean
  items: Inline[][]
}

interface CodeBlock {
  kind: "code"
  language: string
  code: string
}

interface QuoteBlock {
  kind: "quote"
  content: Inline[]
}

interface TableBlock {
  kind: "table"
  headers: string[]
  rows: string[][]
}

export type ArticleBlock = HeadingBlock | ParagraphBlock | ListBlock | CodeBlock | QuoteBlock | TableBlock

export interface Article {
  slug: string
  title: string
  excerpt: string
  category: Category
  tags: string[]
  publishedAt: string
  updatedAt?: string
  blocks: ArticleBlock[]
}

export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  featured: boolean
  isSample: boolean
  articleSlug: string
  highlights: string[]
  sourceUrl?: string
  demoUrl?: string
  downloadUrl?: string
}
