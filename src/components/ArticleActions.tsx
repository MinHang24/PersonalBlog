"use client"

import { useEffect, useState } from "react"
import { Button } from "@figma/astraui"
import { ArrowLeft, Copy } from "lucide-react"
import { AppLink } from "./ui"
import { useCopy } from "./Feedback"

export function ArticleBackLink() {
  const [from, setFrom] = useState("/blog")
  useEffect(() => {
    const candidate = new URLSearchParams(window.location.search).get("from")
    setFrom(
      candidate &&
        /^\/blog\/?(?:\?|$)/.test(candidate) &&
        candidate.length <= 1000
        ? candidate
        : "/blog",
    )
  }, [])
  return (
    <AppLink to={from} className="back-link">
      <ArrowLeft className="icon-sm" aria-hidden="true" />
      返回文章
    </AppLink>
  )
}
export function CopyArticleLink() {
  const copy = useCopy()
  return (
    <Button
      variant="neutral"
      size="small"
      iconStart={<Copy className="icon-sm" aria-hidden="true" />}
      onClick={() => {
        const url = new URL(window.location.href)
        url.search = ""
        void copy(url.toString())
      }}
    >
      复制文章链接
    </Button>
  )
}
