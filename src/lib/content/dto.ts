import type {
  Media,
  Post,
  Project as PayloadProject,
  SiteSetting,
} from "@/payload-types"
import type { Category, Project } from "@/content/types"
import {
  contentHeadings,
  estimateReadingTime,
  lexicalPlainText,
  safeContentLink,
  type LegacyAnchor,
  type RichDocument,
} from "./richtext"

export interface ArticleSummary {
  slug: string
  title: string
  excerpt: string
  category: Category
  tags: string[]
  publishedAt: string
  updatedAt?: string
  readingTime: number
  cover: PublicImage | null
}
export interface PublicImage {
  url: string
  alt: string
  width: number
  height: number
}
export interface ArticleDetail extends ArticleSummary {
  content: RichDocument | null
  headings: ReturnType<typeof contentHeadings>
}
export interface ProjectSummary extends Project {
  slug: string
  cover: PublicImage | null
}
export interface ProjectDetail extends ProjectSummary {
  content: RichDocument | null
}
export interface PublicSite {
  siteTitle: string
  siteSubtitle: string
  authorName: string
  initials: string
  tagline: string
  bio: string
  email: string
  githubUrl: string
  avatarUrl: string
  avatar: PublicImage | null
  about: RichDocument | null
  socialLinks: {
    label: string
    url: string
  }[]
  expertise: {
    id: Category
    title: string
    description: string
    detail: string
  }[]
  techStack: {
    name: string
    kind: Category
    note: string
  }[]
}

export function publicImage(
  value: string | Media | null | undefined,
): PublicImage | null {
  if (
    !value ||
    typeof value !== "object" ||
    !value.url ||
    !value.width ||
    !value.height
  )
    return null
  return {
    url: value.url,
    alt: value.alt || "",
    width: value.width,
    height: value.height,
  }
}

function tagNames(values: Post["_h_tags"]): string[] {
  return (values ?? []).flatMap((tag) =>
    typeof tag === "object" && tag && tag.name ? [tag.name] : [],
  )
}

export function postSummary(doc: Post): ArticleSummary {
  return {
    slug: doc.slug || "",
    title: doc.title,
    excerpt: doc.excerpt || "",
    category: doc.category || "go",
    tags: tagNames(doc._h_tags),
    publishedAt: doc.publishedAt || doc.createdAt,
    updatedAt: doc.updatedAt,
    readingTime: estimateReadingTime(lexicalPlainText(doc.content)),
    cover: publicImage(doc.cover),
  }
}

export function postDetail(doc: Post): ArticleDetail {
  const content = doc.content as unknown as RichDocument | null
  return {
    ...postSummary(doc),
    content,
    headings: contentHeadings(
      content,
      Array.isArray(doc.legacyHeadingAnchors)
        ? doc.legacyHeadingAnchors as unknown as LegacyAnchor[]
        : [],
    ),
  }
}

export function projectSummary(doc: PayloadProject): ProjectSummary {
  const related = typeof doc.relatedPost === "object" ? doc.relatedPost : null
  return {
    id: doc.slug || "",
    slug: doc.slug || "",
    title: doc.title,
    description: doc.description || "",
    tags: tagNames(doc._h_tags),
    featured: Boolean(doc.featured),
    isSample: Boolean(doc.isSample),
    articleSlug:
      related?._status === "published" && related.visibility === "public"
        ? related.slug || ""
        : "",
    highlights: (doc.highlights ?? []).map((item) => item.text),
    sourceUrl: safeContentLink(doc.sourceUrl, true) || undefined,
    demoUrl: safeContentLink(doc.demoUrl, true) || undefined,
    downloadUrl: safeContentLink(doc.downloadUrl, true) || undefined,
    cover: publicImage(doc.cover),
  }
}

export function publicSite(doc: SiteSetting): PublicSite {
  const avatar = publicImage(doc.avatar)
  return {
    siteTitle: doc.siteTitle || "敏航的手记",
    siteSubtitle: doc.siteSubtitle || "",
    authorName: doc.authorName || "敏航",
    initials: doc.initials || "敏",
    tagline: doc.tagline || "",
    bio: doc.bio || "",
    email: doc.email || "",
    githubUrl: safeContentLink(doc.githubUrl, true) || "",
    avatar,
    avatarUrl: avatar?.url || "",
    about: doc.about as unknown as RichDocument | null,
    socialLinks: (doc.socialLinks ?? []).flatMap((link) => {
      const url = safeContentLink(link.url, true)
      return url ? [{ label: link.label, url }] : []
    }),
    expertise: (doc.expertise ?? []).map((item) => ({
      id: item.key,
      title: item.title,
      description: item.description || "",
      detail: item.detail || "",
    })),
    techStack: (doc.techStack ?? []).map((item) => ({
      name: item.name,
      kind: item.kind,
      note: item.note || "",
    })),
  }
}
