import type { Metadata } from "next"
import { NotFoundPage } from "@/views/NotFoundPage"

export const metadata: Metadata = {
  title: "页面未找到",
  robots: { index: false },
}

export default function Page() {
  return <NotFoundPage />
}
