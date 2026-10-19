import type { Metadata } from "next"
import { AboutPage } from "@/views/AboutPage"
import { getPublicSiteSettings } from "@/lib/content/queries"
import { RichContent } from "@/components/RichContent"

export const metadata: Metadata = { title: "关于" }

export default async function Page() {
  const site = await getPublicSiteSettings()
  return (
    <AboutPage
      site={{ ...site, about: null }}
      about={<RichContent content={site.about} />}
    />
  )
}
