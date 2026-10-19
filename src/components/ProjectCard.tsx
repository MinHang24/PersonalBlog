import { Badge } from "@figma/astraui"
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Monitor,
  Terminal,
} from "lucide-react"
import Image from "next/image"
import type { ProjectSummary } from "@/lib/content/dto"
import { DesktopPreview } from "./DesktopPreview"
import { AppLink, ExternalLink, GlassSurface, Typography } from "./ui"

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <GlassSurface
      as="article"
      id={project.id}
      className={`project-card ${
        project.featured ? "project-card--featured" : ""
      }`}
    >
      <div className="project-card-content">
        <div className="project-label">
          <span
            className={`project-symbol ${
              project.featured ? "project-symbol--featured" : ""
            }`}
          >
            {project.featured ? (
              <Monitor aria-hidden="true" />
            ) : (
              <Terminal aria-hidden="true" />
            )}
          </span>
          <Typography variant="eyebrow">
            {project.featured
              ? "FEATURED PROJECT / 重点项目"
              : "SIDE PROJECT / 探索项目"}
          </Typography>
        </div>
        <Typography as="h2" variant="section">
          <AppLink to={`/projects/${project.slug}`}>{project.title}</AppLink>
        </Typography>
        {project.isSample && (
          <Badge
            label="示例项目"
            variant="secondary"
            className="sample-badge"
          />
        )}
        <Typography className="project-description">
          {project.description}
        </Typography>
        <div className="article-tags">
          {project.tags.map((tag) => (
            <Badge
              label={tag}
              key={tag}
              variant="secondary"
              className="tech-badge"
            />
          ))}
        </div>
        <ul className="project-highlights">
          {project.highlights.map((item) => (
            <li key={item}>
              <Check className="icon-sm" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="project-links">
          <AppLink to={`/projects/${project.slug}`} className="text-link">
            查看项目详情
            <ArrowUpRight className="icon-sm" aria-hidden="true" />
          </AppLink>
          {project.articleSlug && (
            <AppLink to={`/blog/${project.articleSlug}`} className="text-link">
              阅读设计笔记
              <ArrowRight className="icon-sm" aria-hidden="true" />
            </AppLink>
          )}
          {project.sourceUrl && (
            <ExternalLink href={project.sourceUrl} className="text-link">
              <Code2 className="icon-sm" />
              源代码
            </ExternalLink>
          )}
          {project.demoUrl && (
            <ExternalLink href={project.demoUrl} className="text-link">
              在线演示
              <ArrowUpRight className="icon-sm" />
            </ExternalLink>
          )}
          {project.downloadUrl && (
            <ExternalLink href={project.downloadUrl} className="text-link">
              下载
              <ArrowUpRight className="icon-sm" />
            </ExternalLink>
          )}
        </div>
      </div>
      {project.cover ? (
        <Image
          src={project.cover.url}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          sizes="(max-width: 768px) 90vw, 50vw"
          className="h-full w-full object-cover"
        />
      ) : project.featured ? (
        <DesktopPreview />
      ) : (
        <div
          className={`project-code-art ${
            project.id === "go-worker-queue" ? "category-go" : "category-rust"
          }`}
          aria-hidden="true"
        >
          <span>
            {project.id === "go-worker-queue" ? "go func()" : "Result<T, E>"}
          </span>
          <span className="code-art-line" />
          <span className="code-art-line" />
          <span className="code-art-line" />
        </div>
      )}
    </GlassSurface>
  )
}
