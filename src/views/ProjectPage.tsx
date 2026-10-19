import Image from "next/image"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/astra"
import {
  AppLink,
  ExternalLink,
  GlassSurface,
  Typography,
} from "@/components/ui"
import { RichContent } from "@/components/RichContent"
import { DesktopPreview } from "@/components/DesktopPreview"
import type { ProjectDetail } from "@/lib/content/dto"
import { contentHeadings } from "@/lib/content/richtext"

export function ProjectPage({
  project,
  preview = false,
}: {
  project: ProjectDetail
  preview?: boolean
}) {
  return (
    <article className="projects-page">
      <AppLink to="/projects" className="back-link">
        <ArrowLeft className="icon-sm" />
        所有项目
      </AppLink>
      {preview && (
        <Typography className="my-xl">授权草稿／隐藏预览 · 不公开</Typography>
      )}
      <header className="page-heading">
        <Typography variant="eyebrow">
          FROM AN IDEA TO SOMETHING REAL / 项目手记
        </Typography>
        <Typography as="h1" variant="page">
          {project.title}
        </Typography>
        <Typography>{project.description}</Typography>
        <div className="article-tags my-xl">
          {project.isSample && <Badge label="示例项目" variant="secondary" />}
          {project.tags.map((tag) => (
            <Badge key={tag} label={tag} variant="secondary" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2xl">
          {project.articleSlug && (
            <AppLink to={`/blog/${project.articleSlug}`} className="text-link">
              阅读关联实践
              <ArrowUpRight className="icon-sm" />
            </AppLink>
          )}
          {[
            [project.sourceUrl, "源代码"],
            [project.demoUrl, "在线演示"],
            [project.downloadUrl, "公开下载"],
          ].map(
            ([href, label]) =>
              href && (
                <ExternalLink href={href} key={label} className="text-link">
                  {label}
                  <ArrowUpRight className="icon-sm" />
                </ExternalLink>
              ),
          )}
        </div>
      </header>
      <GlassSurface variant="reading">
        {project.cover ? (
          <Image
            src={project.cover.url}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            sizes="90vw"
            className="mb-2xl h-auto w-full rounded-corner-lg"
          />
        ) : (
          project.featured && <DesktopPreview />
        )}
        <RichContent
          content={project.content}
          headings={contentHeadings(project.content)}
        />
      </GlassSurface>
    </article>
  )
}
