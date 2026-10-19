import { HomePage } from "@/views/HomePage"
import {
  getPublicSiteSettings,
  getPublishedPostSummaries,
  getPublishedProjects,
} from "@/lib/content/queries"

export default async function Page() {
  const [site, articles, projects] = await Promise.all([
    getPublicSiteSettings(),
    getPublishedPostSummaries(),
    getPublishedProjects(),
  ])
  return (
    <HomePage
      site={{ ...site, about: null }}
      articles={articles}
      projects={projects}
    />
  )
}
