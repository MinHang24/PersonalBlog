import { createElement } from "react"
import { IconButton, Tooltip } from "@figma/astraui"
import { Copy } from "lucide-react"
import type { Article, Inline } from "../content/types"
import { AppLink, ExternalLink, Typography } from "./ui"
import { useCopy } from "./Feedback"

function InlineContent({ content }: { content: Inline[] }) {
  return (
    <>
      {content.map((item, i) => {
        if (typeof item === "string") return item
        if (item.kind === "code")
          return (
            <code key={i} className="inline-code">
              {item.text}
            </code>
          )
        if (item.kind === "strong") return <strong key={i}>{item.text}</strong>
        return item.href.startsWith("/") ? (
          <AppLink key={i} to={item.href}>
            {item.text}
          </AppLink>
        ) : (
          <ExternalLink key={i} href={item.href}>
            {item.text}
          </ExternalLink>
        )
      })}
    </>
  )
}

export function ArticleContent({ article }: { article: Article }) {
  const copy = useCopy()
  return (
    <div className="article-prose">
      {article.blocks.map((block, i) => {
        switch (block.kind) {
          case "heading":
            return (
              <Typography
                key={block.id}
                as={block.level === 2 ? "h2" : "h3"}
                variant={block.level === 2 ? "section" : "card"}
                id={block.id}
                className="prose-heading"
              >
                {block.text}
              </Typography>
            )
          case "paragraph":
            return (
              <Typography key={i}>
                <InlineContent content={block.content} />
              </Typography>
            )
          case "quote":
            return (
              <blockquote key={i}>
                <InlineContent content={block.content} />
              </blockquote>
            )
          case "list":
            return createElement(
              block.ordered ? "ol" : "ul",
              { key: i },
              block.items.map((item, j) => (
                <li key={j}>
                  <InlineContent content={item} />
                </li>
              )),
            )
          case "code":
            return (
              <div className="code-block" key={i}>
                <div className="code-block-header">
                  <span>{block.language}</span>
                  <Tooltip content="复制代码">
                    <IconButton
                      variant="subtle"
                      size="small"
                      aria-label="复制代码"
                      icon={<Copy className="icon-sm" aria-hidden="true" />}
                      onClick={() => void copy(block.code)}
                    />
                  </Tooltip>
                </div>
                <pre>
                  <code>{block.code}</code>
                </pre>
              </div>
            )
          case "table":
            return (
              <div
                className="table-scroll"
                key={i}
                tabIndex={0}
                role="region"
                aria-label={`${article.title}，数据表格`}
              >
                <table>
                  <thead>
                    <tr>
                      {block.headers.map((header) => (
                        <th key={header} scope="col">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td key={k}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      })}
    </div>
  )
}
