import type { Metadata } from "next"
import { SiteLayout } from "@/components/SiteLayout"
import {
  getPublicSiteSettings,
  getPublishedPostSummaries,
} from "@/lib/content/queries"
import { NotFoundPage } from "@/views/NotFoundPage"
import "./styles.css"

export const metadata: Metadata = {
  title: "页面未找到 · 敏航的手记",
  description: "这个页面暂时找不到了。回到首页，或者从一篇新的手记继续探索。",
  robots: { index: false, follow: false },
}

// Multiple root layouts require a global document for URLs outside every route group.
export default async function GlobalNotFound() {
  const [site, articles] = await Promise.all([
    getPublicSiteSettings(),
    getPublishedPostSummaries(),
  ])
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <SiteLayout site={{ ...site, about: null }} articles={articles}>
          <NotFoundPage />
        </SiteLayout>
      </body>
    </html>
  )
}
