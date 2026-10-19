import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getPublicSiteSettings,
  getPublishedPost,
  getPublishedPostSummaries,
} from "@/lib/content/queries"
import { ArticlePage } from "@/views/ArticlePage"

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false
export const dynamic = "force-static"

export async function generateStaticParams() {
  return (await getPublishedPostSummaries()).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getPublishedPost(slug)
  if (!article) notFound()
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
    },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const [article, articles, site] = await Promise.all([
    getPublishedPost(slug),
    getPublishedPostSummaries(),
    getPublicSiteSettings(),
  ])
  if (!article) notFound()
  return <ArticlePage article={article} articles={articles} site={site} />
}
