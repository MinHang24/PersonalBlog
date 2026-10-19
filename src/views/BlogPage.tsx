"use client"
// Native history keeps filtering local while Next tracks the shared URL state.
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button, IconButton, InputField } from "@figma/astraui"
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react"
import type { ArticleSummary } from "@/lib/content/dto"
import { ArticleCard } from "../components/ArticleCard"
import { GlassSurface, Typography } from "../components/ui"
import { blogParams, categories, getBlogState } from "../lib/articles"

export function BlogPage({ articles }: { articles: ArticleSummary[] }) {
  const params = useSearchParams()
  const state = getBlogState(articles, new URLSearchParams(params.toString()))
  const { query, category, page, pageCount, results, visible } = state
  useEffect(() => {
    const normalized = blogParams(query, category, page)
    if (normalized.toString() !== params.toString())
      updateBlogUrl(normalized, true)
  }, [params, query, category, page])
  const update = (q: string, c: string, p = 1, replace = false) =>
    updateBlogUrl(blogParams(q, c, p), replace)
  const from = `/blog${params.size ? `?${params.toString()}` : ""}`

  return (
    <div className="blog-page page-enter">
      <div className="page-heading">
        <Typography variant="eyebrow">THINKING IN PUBLIC / 公开思考</Typography>
        <div className="page-title-row">
          <Typography as="h1" variant="page">
            写下代码，也写下思考<span className="heading-period">。</span>
          </Typography>
          <span className="article-count">
            {articles.length.toString().padStart(2, "0")}
            <span>篇手记</span>
          </span>
        </div>
        <Typography>
          关于 Go、Rust、音视频与桌面开发。把实践沉淀成文字，让经验可以被分享。
        </Typography>
      </div>
      <GlassSurface className="blog-toolbar">
        <div
          className="filter-buttons"
          role="group"
          aria-label="按文章分类筛选"
        >
          {[{ id: "", label: "全部" }, ...categories].map((item) => (
            <Button
              key={item.id}
              variant={category === item.id ? "primary" : "subtle"}
              size="small"
              onClick={() => update(query, item.id)}
              aria-pressed={category === item.id}
            >
              {item.label}
              <span className="filter-count">
                {item.id
                  ? articles.filter((article) => article.category === item.id)
                      .length
                  : articles.length}
              </span>
            </Button>
          ))}
        </div>
        <InputField
          className="blog-search"
          aria-label="搜索文章"
          placeholder="搜索文章、标签…"
          prefix={<Search className="icon-sm" aria-hidden="true" />}
          suffix={
            query ? (
              <IconButton
                variant="subtle"
                size="small"
                aria-label="清除搜索"
                onClick={() => update("", category)}
                icon={<X className="icon-xs" aria-hidden="true" />}
              />
            ) : undefined
          }
          value={query}
          onChange={(value) => update(value, category, 1, true)}
        />
      </GlassSurface>
      <div className="blog-result-summary">
        <span role="status" aria-live="polite">
          {query.trim()
            ? `“${query.trim()}” 的搜索结果`
            : category
              ? `${categories.find((item) => item.id === category)?.label} 分类`
              : "全部手记"}
          <span className="result-dot">·</span>
          {results.length} 篇文章
        </span>
        <span>按发布时间排序</span>
      </div>
      {visible.length > 0 ? (
        <div className="article-grid">
          {visible.map((article) => (
            <ArticleCard key={article.slug} article={article} from={from} />
          ))}
        </div>
      ) : (
        <GlassSurface className="empty-state">
          <Search aria-hidden="true" />
          <Typography as="h2" variant="section">
            没有找到相关文章
          </Typography>
          <Typography>
            换一个关键词，或者清除筛选，重新发现一些有意思的内容。
          </Typography>
          <Button variant="neutral" onClick={() => update("", "")}>
            清除筛选
          </Button>
        </GlassSurface>
      )}
      {results.length > 0 && (
        <nav className="pagination" aria-label="文章分页">
          <Button
            variant="subtle"
            size="small"
            disabled={page === 1}
            onClick={() => update(query, category, page - 1)}
            iconStart={<ArrowLeft className="icon-sm" aria-hidden="true" />}
          >
            上一页
          </Button>
          <div>
            {Array.from({ length: pageCount }, (_, i) => (
              <Button
                key={i}
                variant={i + 1 === page ? "primary" : "subtle"}
                size="small"
                aria-label={`第 ${i + 1} 页`}
                aria-current={i + 1 === page ? "page" : undefined}
                onClick={() => update(query, category, i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="subtle"
            size="small"
            disabled={page === pageCount}
            onClick={() => update(query, category, page + 1)}
            iconEnd={<ArrowRight className="icon-sm" aria-hidden="true" />}
          >
            下一页
          </Button>
        </nav>
      )}
      <div className="page-note">
        <span className="status-dot" />
        这里还在生长，下一篇思考正在路上。
      </div>
    </div>
  )
}

function updateBlogUrl(params: URLSearchParams, replace: boolean) {
  const url = `/blog${params.size ? `?${params.toString()}` : ""}`
  window.history[replace ? "replaceState" : "pushState"](null, "", url)
}
