import { Suspense } from "react"
import type { Metadata } from "next"
import { BlogPage } from "@/views/BlogPage"
import { Typography } from "@/components/ui"
import { getPublishedPostSummaries } from "@/lib/content/queries"

export const metadata: Metadata = { title: "文章" }

export default async function Page() {
  const articles = await getPublishedPostSummaries()
  return (
    <Suspense fallback={<Typography>正在整理手记…</Typography>}>
      <BlogPage articles={articles} />
    </Suspense>
  )
}
