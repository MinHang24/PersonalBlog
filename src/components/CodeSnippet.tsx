"use client"

import { IconButton, Tooltip } from "@figma/astraui"
import { Copy } from "lucide-react"
import { useCopy } from "./Feedback"

export function CodeSnippet({
  code,
  language,
}: {
  code: string
  language: string
}) {
  const copy = useCopy()
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{language}</span>
        <Tooltip content="复制代码">
          <IconButton
            variant="subtle"
            size="small"
            aria-label="复制代码"
            icon={<Copy className="icon-sm" aria-hidden="true" />}
            onClick={() => void copy(code)}
          />
        </Tooltip>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}
