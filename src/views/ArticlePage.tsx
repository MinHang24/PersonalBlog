import { Badge } from "@/components/astra"
import { ArrowLeft, ArrowRight, Clock, Code2 } from "lucide-react"
import type {
  ArticleDetail,
  ArticleSummary,
  PublicSite,
} from "@/lib/content/dto"
import { RichContent } from "@/components/RichContent"
import { ArticleBackLink, CopyArticleLink } from "@/components/ArticleActions"
import { TableOfContents } from "@/components/TableOfContents"
import { AppLink, GlassSurface, Typography } from "@/components/ui"
import { categoryLabel, formatDate } from "@/lib/articles"
import { AuthorAvatar } from "@/components/AuthorAvatar"

export function ArticlePage({
  article,
  articles,
  site,
  preview = false,
}: {
  article: ArticleDetail
  articles: ArticleSummary[]
  site: PublicSite
  preview?: boolean
}) {
  const index = articles.findIndex((item) => item.slug === article.slug)
  const previous = index >= 0 ? articles[index + 1] : undefined
  const next = index > 0 ? articles[index - 1] : undefined
  return (
    <article className="article-page">
      <ArticleBackLink />
      {preview && (
        <Typography className="my-xl rounded-corner-lg bg-bg-subtle p-xl">
          授权内容预览 · 此页面不公开，也不会进入搜索索引。
        </Typography>
      )}
      <header className="article-heading">
        <span className={`category-label category-${article.category}`}>
          <i />
          {categoryLabel(article.category)}
        </span>
        <Typography as="h1" variant="page">
          {article.title}
        </Typography>
        <Typography className="article-lead">{article.excerpt}</Typography>
        <div className="article-byline">
          <AuthorAvatar site={site} />
          <span>{site.authorName}</span>
          <span className="byline-dot">·</span>
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
          <span className="byline-dot">·</span>
          <span className="byline-reading">
            <Clock className="icon-xs" aria-hidden="true" />
            {article.readingTime} 分钟阅读
          </span>
        </div>
        <div className="article-tags">
          {article.tags.map((tag) => (
            <Badge
              label={tag}
              key={tag}
              variant="secondary"
              className="tech-badge"
            />
          ))}
        </div>
      </header>
      <div className="article-layout">
        <GlassSurface variant="reading" className="reading-surface">
          <RichContent content={article.content} headings={article.headings} />
          <div className="article-end">
            <span className="article-end-mark">
              <Code2 aria-hidden="true" />
            </span>
            <Typography>感谢阅读，希望这些思考对你有所启发。</Typography>
            {!preview && <CopyArticleLink />}
          </div>
        </GlassSurface>
        <TableOfContents headings={article.headings} slug={article.slug} />
      </div>
      {!preview && (
        <nav className="article-neighbors" aria-label="相邻文章">
          {previous ? (
            <AppLink to={`/blog/${previous.slug}`} className="neighbor-link">
              <span>
                <ArrowLeft className="icon-xs" />
                上一篇
              </span>
              <Typography variant="card">{previous.title}</Typography>
            </AppLink>
          ) : (
            <span />
          )}
          {next && (
            <AppLink
              to={`/blog/${next.slug}`}
              className="neighbor-link neighbor-next"
            >
              <span>
                下一篇
                <ArrowRight className="icon-xs" />
              </span>
              <Typography variant="card">{next.title}</Typography>
            </AppLink>
          )}
        </nav>
      )}
    </article>
  )
}
