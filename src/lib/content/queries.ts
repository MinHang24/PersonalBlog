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
  return mods.map((m) => m.article || m.default).filter(Boolean)
}

export async function getPublicSiteSettings() {
  return {
    siteTitle: site.siteTitle,
    siteSubtitle: site.siteSubtitle,
    authorName: site.authorName,
    initials: site.initials,
    avatarUrl: site.avatarUrl,
    tagline: site.tagline,
    bio: site.bio,
    email: site.email,
    githubUrl: site.githubUrl,
    socialLinks: site.socialLinks,
    expertise: site.expertise,
  }
}

export async function getPublishedPostSummaries() {
  const articles = await loadArticles()
  return articles.map((a: any) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || a.summary || "",
    publishedAt: a.publishedAt || a.date || "2026-01-01",
    readingMinutes: a.readingMinutes || 5,
    tags: a.tags || [],
    category: a.category || "",
  }))
}

export async function getPublishedProjects() {
  return projects.map((p: Project) => ({
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

export async function getPostDetail(slug: string) {
  const articles = await loadArticles()
  return articles.find((a: any) => a.slug === slug) || null
}

export async function getProjectDetail(id: string) {
  return projects.find((p) => p.id === id) || null
}
