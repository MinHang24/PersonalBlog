"use client"

import { useEffect, useState } from "react"
import { Button } from "@figma/astraui"
import { ChevronDown, List } from "lucide-react"
import type { ContentHeading } from "@/lib/content/richtext"
import { AppLink, GlassSurface, Typography } from "./ui"

export function TableOfContents({
  headings,
  slug,
}: {
  headings: ContentHeading[]
  slug: string
}) {
  const [active, setActive] = useState(headings[0]?.id)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    setActive(headings[0]?.id)
    setExpanded(false)
    const styles = getComputedStyle(document.documentElement)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      {
        rootMargin: `-${styles.scrollPaddingTop} 0% ${styles.getPropertyValue("--blog-toc-bottom-margin").trim()} 0%`,
      },
    )
    for (const heading of headings) {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [slug, headings])
  if (!headings.length) return null
  return (
    <GlassSurface
      as="aside"
      className={`table-of-contents ${expanded ? "toc-expanded" : ""}`}
    >
      <div className="toc-desktop-heading">
        <List className="icon-sm" aria-hidden="true" />
        <Typography as="h2" variant="small">
          在这篇文章中
        </Typography>
      </div>
      <Button
        variant="subtle"
        className="toc-mobile-toggle"
        iconStart={<List className="icon-sm" aria-hidden="true" />}
        iconEnd={<ChevronDown className="icon-sm" aria-hidden="true" />}
        aria-expanded={expanded}
        aria-controls="article-toc-links"
        onClick={() => setExpanded(!expanded)}
      >
        文章目录
      </Button>
      <nav id="article-toc-links" className="toc-links" aria-label="文章目录">
        {headings.map((heading) => (
          <AppLink
            key={heading.id}
            to={`#${heading.id}`}
            onClick={() => setActive(heading.id)}
            className={`toc-link ${heading.level === 3 ? "toc-link-sub" : ""} ${
              active === heading.id ? "is-active" : ""
            }`}
            aria-current={active === heading.id ? "location" : undefined}
          >
            {heading.text}
          </AppLink>
        ))}
      </nav>
      <div className="toc-footer">
        慢慢读，慢慢想。
        <br />
        每一段实践，都值得留下。
      </div>
    </GlassSurface>
  )
}
