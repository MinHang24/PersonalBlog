import { ArrowUpRight, Clock } from "lucide-react"
import { Badge } from "@figma/astraui"
import type { ArticleSummary } from "@/lib/content/dto"
import Image from "next/image"
import { categoryLabel, formatDate, readingMinutes } from "../lib/articles"
import { AppLink, GlassSurface, Typography } from "./ui"
import { CategoryIcon } from "./CategoryIcon"

export function ArticleCard({
  article,
  from = "/blog",
}: {
  article: ArticleSummary
  from?: string
}) {
  return (
    <GlassSurface
      as="article"
      className={`article-card category-${article.category}`}
    >
      {article.cover && (
        <Image
          src={article.cover.url}
          alt={article.cover.alt}
          width={article.cover.width}
          height={article.cover.height}
          sizes="(max-width: 768px) 90vw, 33vw"
          className="mb-xl aspect-video w-full rounded-corner-lg object-cover"
        />
      )}
      <div className="article-card-top">
        <CategoryIcon category={article.category} />
        <span className="category-label">
          {categoryLabel(article.category)}
        </span>
        <span className="article-card-arrow">
          <ArrowUpRight aria-hidden="true" />
        </span>
      </div>
      <Typography as="h2" variant="card">
        <AppLink
          to={{ pathname: `/blog/${article.slug}`, query: { from } }}
          className="article-title-link"
        >
          {article.title}
        </AppLink>
      </Typography>
      <Typography variant="small" className="article-excerpt">
        {article.excerpt}
      </Typography>
      <div className="article-tags">
        {article.tags.slice(0, 3).map((tag) => (
          <Badge
            key={tag}
            label={tag}
            variant="secondary"
            className="tech-badge"
          />
        ))}
      </div>
      <div className="article-card-meta">
        <time dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
        <span>
          <Clock className="icon-xs" aria-hidden="true" />
          {readingMinutes(article)} 分钟阅读
        </span>
      </div>
    </GlassSurface>
  )
}
