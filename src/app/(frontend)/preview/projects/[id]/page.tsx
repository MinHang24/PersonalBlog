import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { CmsAuthError, requireCmsPrincipal } from "@/lib/cms-auth"
import { projectSummary } from "@/lib/content/dto"
import type { RichDocument } from "@/lib/content/richtext"
import { ProjectPage } from "@/views/ProjectPage"
import { AppLink, GlassSurface, Typography } from "@/components/ui"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "授权项目预览",
  robots: { index: false, follow: false },
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  let principal
  try {
    principal = await requireCmsPrincipal(await headers())
  } catch (error) {
    if (!(error instanceof CmsAuthError)) throw error
    return (
      <GlassSurface>
        <Typography as="h1" variant="section">
          预览受保护
        </Typography>
        <Typography>{error.message}</Typography>
        <AppLink to="/admin" className="text-link">
          返回原生后台
        </AppLink>
      </GlassSurface>
    )
  }
  const { id } = await params
  const result = await principal.payload.find({
    collection: "projects",
    where: { id: { equals: id } },
    limit: 1,
    depth: 2,
    draft: true,
    overrideAccess: false,
    user: principal.user,
  })
  const doc = result.docs[0]
  if (!doc) notFound()
  return (
    <ProjectPage
      project={{
        ...projectSummary(doc),
        content: doc.content as unknown as RichDocument | null,
      }}
      preview
    />
  )
}
