import type { Metadata } from "next"
import { DesignSystemPage } from "@/views/DesignSystemPage"

export const metadata: Metadata = { title: "设计系统" }

export default function Page() {
  return <DesignSystemPage />
}
