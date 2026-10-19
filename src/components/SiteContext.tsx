"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { PublicSite } from "@/lib/content/dto"

const SiteContext = createContext<PublicSite | null>(null)
export function SiteContentProvider({
  site,
  children,
}: {
  site: PublicSite
  children: ReactNode
}) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>
}
export function useSiteContent() {
  const site = useContext(SiteContext)
  if (!site) throw new Error("SiteContentProvider is required")
  return site
}
