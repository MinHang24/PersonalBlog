"use client"

import { Badge } from "@figma/astraui"
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Command,
  Coffee,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react"
import type {
  ArticleSummary,
  ProjectSummary,
  PublicSite,
} from "@/lib/content/dto"
import type { Category } from "../content/types"
import { categoryLabel, formatDate } from "../lib/articles"
import { AppLink, GlassSurface, TextLink, Typography } from "../components/ui"
import { CategoryIcon } from "../components/CategoryIcon"
import { DesktopPreview } from "../components/DesktopPreview"
import { AuthorAvatar } from "@/components/AuthorAvatar"

export function HomePage({
  articles,
  projects,
  site,
}: {
  articles: ArticleSummary[]
  projects: ProjectSummary[]
  site: PublicSite
}) {
  const featured = projects.find((project) => project.featured) || projects[0]
  return (
    <div className="home-page page-enter">
      <div className="home-intro-line">
        <span>
          <span className="status-dot" />
          一个关于代码、创造与好奇心的地方
        </span>
        <span className="intro-date">
          EST. 2025 <span> / </span> PERSONAL BLOG
        </span>
      </div>
      <div className="bento-grid">
        <GlassSurface className="hero-card bento-hero">
          <div className="hero-hello">
            <AuthorAvatar site={site} />
            <span>
              你好，我是{site.authorName}
              <span className="hello-divider"> / </span>
              <span className="hero-role">乐于构建，也乐于分享</span>
            </span>
          </div>
          <Typography as="h1" variant="hero" className="text-balance">
            {site.tagline}
          </Typography>
          <Typography className="hero-description">{site.bio}</Typography>
          <div className="hero-actions">
            <AppLink to="/blog" className="button-link button-link--primary">
              阅读文章
              <ArrowUpRight className="icon-sm" aria-hidden="true" />
            </AppLink>
            <AppLink to="/about" className="hero-about-link">
              了解我
              <ArrowRight className="icon-sm" aria-hidden="true" />
            </AppLink>
          </div>
          <div className="hero-code-art" aria-hidden="true">
            <span>{"{"}</span>
            <i />
            <span>{"}"}</span>
            <small>ideas.into(reality)</small>
          </div>
          <span className="hero-corner-label" aria-hidden="true">
            <Code2 className="icon-xs" /> CRAFTED WITH CURIOSITY
          </span>
        </GlassSurface>
        <GlassSurface className="expertise-card bento-expertise">
          <div className="card-eyebrow">
            <span>
              <Sparkles className="icon-sm" aria-hidden="true" />
              专注的领域
            </span>
            <span>01 — 04</span>
          </div>
          <Typography as="h2" variant="card">
            保持专注，也保持探索。
          </Typography>
          <div className="expertise-grid">
            {site.expertise.map((item) => (
              <AppLink
                key={item.id}
                to={`/blog?category=${item.id}`}
                className={`expertise-item category-${item.id}`}
              >
                <CategoryIcon category={item.id as Category} />
                <span className="expertise-title">{item.title}</span>
                <span className="expertise-description">
                  {item.description}
                </span>
                <ArrowUpRight
                  className="expertise-arrow icon-xs"
                  aria-hidden="true"
                />
              </AppLink>
            ))}
          </div>
        </GlassSurface>
        {featured ? (
          <GlassSurface className="featured-card bento-featured">
            <div className="card-eyebrow">
              <span>
                <Layers className="icon-sm" aria-hidden="true" />
                正在构建
              </span>
              <AppLink
                to={`/projects/${featured.slug}`}
                aria-label={`查看${featured.title}`}
                className="round-link"
              >
                <ArrowUpRight className="icon" aria-hidden="true" />
              </AppLink>
            </div>
            <Typography as="h2" variant="section">
              {featured.title}
            </Typography>
            <Typography variant="small" className="featured-description">
              {featured.description}
            </Typography>
            <div className="article-tags">
              {featured.tags.map((tag) => (
                <Badge
                  key={tag}
                  label={tag}
                  variant="secondary"
                  className="tech-badge"
                />
              ))}
            </div>
            <DesktopPreview />
          </GlassSurface>
        ) : (
          <GlassSurface className="bento-featured">
            <Typography as="h2" variant="section">
              下一个想法，正在酝酿。
            </Typography>
            <Typography>项目发布后，会在这里与你见面。</Typography>
          </GlassSurface>
        )}
        <GlassSurface className="latest-card bento-latest">
          <div className="card-eyebrow">
            <span>
              <FileText className="icon-sm" aria-hidden="true" />
              最近的文字
            </span>
            <span className="mono">/ NOTES</span>
          </div>
          <Typography as="h2" variant="section">
            记录，让思考有迹可循。
          </Typography>
          <div className="latest-list">
            {articles.slice(0, 3).map((article) => (
              <AppLink
                to={`/blog/${article.slug}`}
                key={article.slug}
                className="latest-article"
              >
                <div className="latest-article-info">
                  <span
                    className={`category-label category-${article.category}`}
                  >
                    <i />
                    {categoryLabel(article.category)}
                  </span>
                  <Typography as="h3" variant="body">
                    {article.title}
                  </Typography>
                </div>
                <span className="latest-date">
                  <time dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt, true)}
                  </time>
                  <ArrowUpRight className="icon-sm" aria-hidden="true" />
                </span>
              </AppLink>
            ))}
          </div>
          {!articles.length && (
            <Typography variant="small">
              还没有公开文章，下一篇思考正在路上。
            </Typography>
          )}
          <TextLink to="/blog">全部 {articles.length} 篇文章</TextLink>
        </GlassSurface>
        <GlassSurface className="stack-card bento-stack">
          <div className="card-eyebrow">
            <span>
              <Command className="icon-sm" aria-hidden="true" />
              工具箱
            </span>
            <span>LESS, BUT BETTER</span>
          </div>
          <Typography as="h2" variant="card">
            熟悉的工具，新的可能。
          </Typography>
          <div className="stack-items">
            {site.techStack.map((tech) => (
              <AppLink
                key={tech.name}
                to={`/blog?q=${encodeURIComponent(tech.name)}`}
                className={`stack-item category-${tech.kind}`}
              >
                <span className="stack-dot" />
                <span>{tech.name}</span>
              </AppLink>
            ))}
          </div>
        </GlassSurface>
        <GlassSurface className="contact-card bento-contact">
          <div className="card-eyebrow">
            <span>
              <Coffee className="icon-sm" aria-hidden="true" />
              从一次交流开始
            </span>
            <AppLink
              to="/about#contact"
              className="round-link"
              aria-label="前往联系区"
            >
              <ArrowUpRight className="icon" aria-hidden="true" />
            </AppLink>
          </div>
          <Typography as="h2" variant="section">
            好想法，值得聊聊。
          </Typography>
          <Typography variant="small">
            一个技术问题，一次灵感碰撞，或只是打个招呼。
            <br />
            期待和同样热爱创造的你相遇。
          </Typography>
          <TextLink to="/about#contact">一起做点有意思的事</TextLink>
        </GlassSurface>
      </div>
      <div className="home-closing">
        <span />
        <Code2 className="icon-sm" aria-hidden="true" />
        <span className="closing-text">认真写代码，也认真记录。</span>
        <span />
      </div>
    </div>
  )
}
