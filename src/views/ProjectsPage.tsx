"use client"

import { ArrowUpRight, Code2 } from "lucide-react"
import type { ProjectSummary } from "@/lib/content/dto"
import { ProjectCard } from "../components/ProjectCard"
import { AppLink, GlassSurface, Typography } from "../components/ui"

export function ProjectsPage({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className="projects-page page-enter">
      <div className="page-heading">
        <Typography variant="eyebrow">
          IDEAS INTO REALITY / 从想法到作品
        </Typography>
        <Typography as="h1" variant="page">
          不止于想，也动手去做<span className="heading-period">。</span>
        </Typography>
        <Typography>
          一些正在打磨的想法，一些关于工具、体验和技术边界的探索。
        </Typography>
      </div>
      <div className="projects-list">
        {!projects.length && (
          <GlassSurface>
            <Typography>还没有公开项目，敬请期待。</Typography>
          </GlassSurface>
        )}
        {projects.map((project) => (
          <ProjectCard project={project} key={project.id} />
        ))}
      </div>
      <GlassSurface className="project-bottom-note">
        <Code2 aria-hidden="true" />
        <div>
          <Typography as="h2" variant="card">
            构建的过程，也值得被记录。
          </Typography>
          <Typography variant="small">
            这里展示项目方向与原创界面示意，不代表已发布版本；示例项目仅用于说明工程思路。
          </Typography>
        </div>
        <AppLink to="/blog" className="text-link">
          看看实践笔记
          <ArrowUpRight className="icon-sm" />
        </AppLink>
      </GlassSurface>
    </div>
  )
}
