import type { Article, ArticleBlock, Category, Inline } from "../content/types"
import type { ArticleSummary } from "./content/dto"

interface ArticleCategory {
  id: Category
  label: string
  short: string
}

export const categories: ArticleCategory[] = [
  { id: "go", label: "Go", short: "GO" },
  { id: "rust", label: "Rust", short: "RUST" },
  { id: "multimedia", label: "音视频", short: "MEDIA" },
  { id: "desktop", label: "桌面开发", short: "DESKTOP" },
]

export const categoryLabel = (id: Category) =>
  categories.find((item) => item.id === id)!.label
export const inlineText = (content: Inline[]) =>
  content.map((item) => (typeof item === "string" ? item : item.text)).join("")

export function blockText(block: ArticleBlock): string {
  switch (block.kind) {
    case "heading":
      return block.text
    case "paragraph":
    case "quote":
      return inlineText(block.content)
    case "code":
      return block.code
    case "list":
      return block.items.map(inlineText).join(" ")
    case "table":
      return [...block.headers, ...block.rows.flat()].join(" ")
  }
}

export function readingMinutes(article: Article | ArticleSummary) {
  if ("readingTime" in article) return article.readingTime
  const text = article.blocks.map(blockText).join(" ")
  const chinese = (text.match(/[\u3400-\u9fff]/g) || []).length
  const words = (text.match(/[a-zA-Z0-9]+/g) || []).length
  return Math.max(1, Math.ceil(chinese / 280 + words / 200))
}

export function formatDate(date: string, compact = false) {
  const local = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date.length === 10 ? `${date}T00:00:00+08:00` : date))
  const [year, month, day] = local.split("-")
  return compact
    ? `${month}.${day}`
    : `${year} 年 ${Number(month)} 月 ${Number(day)} 日`
}

export function searchArticles(
  articles: ArticleSummary[],
  query: string,
  category = "",
) {
  const normalized = query
    .normalize("NFKC")
    .trim()
    .slice(0, 200)
    .toLocaleLowerCase()
  return articles.filter(
    (article) =>
      (!category || article.category === category) &&
      `${article.title} ${article.excerpt} ${article.tags.join(" ")}`
        .toLocaleLowerCase()
        .includes(normalized),
  )
}

export function getBlogState(
  articles: ArticleSummary[],
  params: URLSearchParams,
) {
  const query = (params.get("q") || "").slice(0, 200)
  const rawCategory = params.get("category") || ""
  const category = categories.some((item) => item.id === rawCategory)
    ? rawCategory
    : ""
  const results = searchArticles(articles, query, category)
  const pageCount = Math.max(1, Math.ceil(results.length / 6))
  const rawPage = params.get("page") || "1"
  const parsedPage = /^[1-9]\d*$/.test(rawPage) ? Number(rawPage) : 1
  const page = Math.min(
    Number.isSafeInteger(parsedPage) ? parsedPage : 1,
    pageCount,
  )
  return {
    query,
    category,
    results,
    pageCount,
    page,
    visible: results.slice((page - 1) * 6, page * 6),
  }
}

export function blogParams(query: string, category: string, page = 1) {
  const params = new URLSearchParams()
  if (query.trim()) params.set("q", query)
  if (category) params.set("category", category)
  if (page > 1) params.set("page", String(page))
  return params
}

export function articleHeadings(article: Article) {
  return article.blocks.filter(
    (block): block is Extract<ArticleBlock, { kind: "heading" }> =>
      block.kind === "heading",
  )
}
