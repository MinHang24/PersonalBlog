"use client"

import { ArrowLeft, ArrowUpRight, Compass } from "lucide-react"
import { AppLink, GlassSurface, Typography } from "../components/ui"

export function NotFoundPage() {
  return (
    <div className="not-found-page page-enter">
      <GlassSurface className="not-found">
        <span className="not-found-number" aria-hidden="true">
          4<Compass />4
        </span>
        <Typography variant="eyebrow">
          A SMALL DETOUR / 偶尔，也会迷路
        </Typography>
        <Typography as="h1" variant="page">
          这个页面暂时找不到了。
        </Typography>
        <Typography>
          也许链接走错了方向，也许内容还在构建中。
          <br />
          不妨回到首页，或者从一篇新的手记继续探索。
        </Typography>
        <div className="not-found-actions">
          <AppLink to="/" className="button-link button-link--primary">
            <ArrowLeft className="icon-sm" aria-hidden="true" />
            返回首页
          </AppLink>
          <AppLink to="/blog" className="text-link">
            浏览文章
            <ArrowUpRight className="icon-sm" aria-hidden="true" />
          </AppLink>
        </div>
        <span className="not-found-code">404 · PAGE NOT FOUND</span>
      </GlassSurface>
    </div>
  )
}
