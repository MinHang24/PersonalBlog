"use client"

import { ThemeProvider } from "@figma/astraui"
import type { ReactNode } from "react"
import { FeedbackProvider } from "./Feedback"
import { SiteHeader } from "./SiteHeader"
import { SiteFooter } from "./SiteFooter"
import type { ArticleSummary, PublicSite } from "@/lib/content/dto"
import { SiteContentProvider } from "./SiteContext"
import { ContentEffects } from "./ContentEffects"

export function SiteLayout({
  children,
  site,
  articles,
}: {
  children: ReactNode
  site: PublicSite
  articles: ArticleSummary[]
}) {
  return (
    <ThemeProvider>
      <FeedbackProvider>
        <SiteContentProvider site={site}>
          <div className="site-shell">
            <SiteHeader articles={articles} />
            <main id="main-content" className="main-content" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
            <ContentEffects />
          </div>
        </SiteContentProvider>
      </FeedbackProvider>
    </ThemeProvider>
  )
}
