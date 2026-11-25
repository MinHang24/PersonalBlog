// 静态导出版 queries：数据来自 src/content（构建时固化，无需 Payload/Figma API）
import { site } from "@/content/site"
import { projects } from "@/content/projects"
import type { Project } from "@/content/types"

// 文章（articles 目录按 slug 导出）
const articleModules = (require as any).context?.("@/content/articles", false, /\.ts$/) // fallback below

async function loadArticles(): Promise<any[]> {
  const mods = await Promise.all([
    import("@/content/articles/av-sync-basics"),
    import("@/content/articles/desktop-state-persistence"),
    import("@/content/articles/ffmpeg-media-pipeline"),
    import("@/content/articles/go-context-cancellation"),
    import("@/content/articles/go-graceful-shutdown"),
    import("@/content/articles/go-worker-pool"),
    import("@/content/articles/hongguo-manju-desktop-notes"),
    import("@/content/articles/rust-cli-error-handling"),
    import("@/content/articles/rust-ownership-in-practice"),
  ])
  return mods.map((m) => m.article).filter(Boolean)
}

async function local_getPublicSiteSettings() {
  return site
}

async function local_getPublishedPostSummaries() {
  const articles = await loadArticles()
  return articles.map((a: any) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || a.summary || "",
    publishedAt: a.publishedAt || a.date || "2026-01-01",
    readingTime: a.readingMinutes || 5,
    readingMinutes: a.readingMinutes || 5,
    tags: a.tags || [],
    category: a.category || "",
  }))
}

async function local_getPublishedProjects() {
  return projects.map((p: Project) => ({
    slug: p.id,
    id: p.id,
    title: p.title,
    description: p.description,
    tags: p.tags,
    featured: p.featured,
    articleSlug: p.articleSlug,
    highlights: p.highlights,
    isSample: p.isSample,
  }))
}

async function local_getPublishedProject(slug: string) {
  return local_getProjectDetail(slug)
}

async function local_getPublishedPost(slug: string) {
  return local_getPostDetail(slug)
}

async function local_getPostDetail(slug: string) {
  const articles = await loadArticles()
  const a: any = articles.find((x: any) => x.slug === slug)
  if (!a) return null
  // blocks → Lexical RichDocument（最小转换：paragraph/heading）
  const children: any[] = []
  const headings: any[] = []
  for (const b of a.blocks || []) {
    if (b.kind === "heading") {
      children.push({
        type: "heading",
        tag: `h${b.level || 2}`,
        children: [{ type: "text", text: b.text || "", format: 0 }],
      })
      headings.push({ id: b.id, text: b.text, level: b.level || 2 })
    } else if (b.kind === "paragraph") {
      children.push({
        type: "paragraph",
        children: [{ type: "text", text: (b.content || []).join(""), format: 0 }],
      })
    } else if (b.kind === "code") {
      children.push({
        type: "paragraph",
        children: [{ type: "text", text: b.code || "", format: 16 }],
      })
    }
  }
  return {
    ...a,
    readingTime: a.readingTime || 5,
    content: { root: { type: "root", children, direction: null, format: "", indent: 0, version: 1 } },
    headings,
  }
}

async function local_getProjectDetail(id: string) {
  return projects.find((p) => p.id === id) || null
}

async function api(path: string): Promise<any> {
 const response = await fetch(`${process.env.BLOG_API_URL}/api/public/${path}`, {cache: "no-store", signal: AbortSignal.timeout(8000)})
 if (response.status === 404) return null
 if (!response.ok) throw new Error(`Blog API returned ${response.status}`)
 return response.json()
}
export async function getPublicSiteSettings(): Promise<any> { return process.env.BLOG_API_URL ? api("settings/site") : local_getPublicSiteSettings() }
export async function getPublishedPostSummaries(): Promise<any[]> { return process.env.BLOG_API_URL ? api("posts") : local_getPublishedPostSummaries() }
export async function getPublishedProjects(): Promise<any[]> { return process.env.BLOG_API_URL ? api("projects") : local_getPublishedProjects() }
export async function getPublishedProject(slug: string): Promise<any> { return process.env.BLOG_API_URL ? api("projects/" + encodeURIComponent(slug)) : local_getPublishedProject(slug) }
export async function getPublishedPost(slug: string): Promise<any> { return process.env.BLOG_API_URL ? api("posts/" + encodeURIComponent(slug)) : local_getPublishedPost(slug) }
export async function getPostDetail(slug: string): Promise<any> { return process.env.BLOG_API_URL ? api("posts/" + encodeURIComponent(slug)) : local_getPostDetail(slug) }
export async function getProjectDetail(slug: string): Promise<any> { return process.env.BLOG_API_URL ? api("projects/" + encodeURIComponent(slug)) : local_getProjectDetail(slug) }
