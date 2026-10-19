import type { Metadata } from "next"
import { ProjectsPage } from "@/views/ProjectsPage"
import { getPublishedProjects } from "@/lib/content/queries"

export const metadata: Metadata = { title: "项目" }

export default async function Page() {
  return <ProjectsPage projects={await getPublishedProjects()} />
}
