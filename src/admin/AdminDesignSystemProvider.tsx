"use client"

import { useEffect, type ReactNode } from "react"
import { useTheme } from "@payloadcms/ui"
import "../app/(frontend)/styles.css"
import "./theme.css"

export function AdminDesignSystemProvider({
  children,
}: {
  children?: ReactNode
}) {
  const { theme } = useTheme()
  useEffect(() => {
    const root = document.documentElement
    root.dataset.minhangAdmin = "true"
    root.classList.toggle("dark", theme === "dark")
    return () => {
      delete root.dataset.minhangAdmin
      root.classList.remove("dark")
    }
  }, [theme])
  return <>{children}</>
}
