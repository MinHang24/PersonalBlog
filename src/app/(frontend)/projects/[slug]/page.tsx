import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getPublishedProject,
  getPublishedProjects,
} from "@/lib/content/queries"
import { ProjectPage } from "@/views/ProjectPage"

type Props = { params: Promise<{ slug: string }> }
export const dynamic = "force-static"
export const dynamicParams = true

export async function generateStaticParams() {
  return (await getPublishedProjects()).map(({ slug }) => ({ slug }))
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getPublishedProject((await params).slug)
  if (!project) notFound()
  return { title: project.title, description: project.description }
}
export default async function Page({ params }: Props) {
  const project = await getPublishedProject((await params).slug)
  if (!project) notFound()
  return <ProjectPage project={project} />
}
