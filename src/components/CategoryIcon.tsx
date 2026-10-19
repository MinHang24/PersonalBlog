import { Code2, Monitor, Play, Terminal } from "lucide-react"
import type { Category } from "../content/types"

const icons = { go: Code2, rust: Terminal, multimedia: Play, desktop: Monitor }

export function CategoryIcon({
  category,
  className = "",
}: {
  category: Category
  className?: string
}) {
  const Icon = icons[category]
  return (
    <span className={`category-icon category-${category} ${className}`}>
      <Icon aria-hidden="true" />
    </span>
  )
}
