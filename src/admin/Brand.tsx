import { Terminal } from "lucide-react"
import { Typography } from "@/components/ui"

export function BrandIcon() {
  return <Terminal className="icon" aria-label="敏航" />
}
export function Brand() {
  return (
    <div className="flex items-center gap-lg">
      <span className="brand-mark">
        <BrandIcon />
      </span>
      <div>
        <Typography variant="card">敏航的手记</Typography>
        <Typography variant="meta">CONTENT STUDIO / 内容工作台</Typography>
      </div>
    </div>
  )
}
