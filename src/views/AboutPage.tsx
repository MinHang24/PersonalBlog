"use client"

import { Badge, Button } from "@figma/astraui"
import {
  ArrowDown,
  ArrowUpRight,
  Code2,
  Coffee,
  Mail,
  Sparkles,
} from "lucide-react"
import type { PublicSite } from "@/lib/content/dto"
import type { ReactNode } from "react"
import type { Category } from "../content/types"
import { CategoryIcon } from "../components/CategoryIcon"
import { AuthorAvatar } from "@/components/AuthorAvatar"
import { useCopy } from "../components/Feedback"
import {
  AppLink,
  ExternalLink,
  GlassSurface,
  Typography,
} from "../components/ui"

export function AboutPage({
  site,
  about,
}: {
  site: PublicSite
  about: ReactNode
}) {
  const copy = useCopy()
  return (
    <div className="about-page page-enter">
      <div className="page-heading">
        <Typography variant="eyebrow">A LITTLE ABOUT ME / 关于我</Typography>
        <Typography as="h1" variant="page">
          热爱技术，也在意体验<span className="heading-period">。</span>
        </Typography>
        <Typography>比起一个标签，我更喜欢用正在做的事情介绍自己。</Typography>
      </div>
      <div className="about-grid">
        <GlassSurface className="about-intro">
          <AuthorAvatar site={site} size="large" />
          <Typography as="h2" variant="section">
            你好，我是{site.authorName}。
          </Typography>
          <Typography>{site.bio}</Typography>
          {about}
          <span className="about-signature">
            Build with care. Share with curiosity.
          </span>
          <AppLink to="#contact" className="text-link">
            很高兴认识你
            <ArrowDown className="icon-sm" aria-hidden="true" />
          </AppLink>
        </GlassSurface>
        <GlassSurface className="about-principles">
          <div className="card-eyebrow">
            <span>
              <Sparkles className="icon-sm" aria-hidden="true" />
              我在意的事
            </span>
          </div>
          {[
            {
              n: "01",
              title: "简单，不等于简陋",
              text: "用尽可能少的复杂度，解决真正的问题。",
            },
            {
              n: "02",
              title: "让边界保持清晰",
              text: "好的抽象，让代码和协作都更容易理解。",
            },
            {
              n: "03",
              title: "先构建，再打磨",
              text: "从一个小的、完整的体验开始，持续改进。",
            },
          ].map((item) => (
            <div className="principle" key={item.n}>
              <span>{item.n}</span>
              <div>
                <Typography as="h3" variant="body">
                  {item.title}
                </Typography>
                <Typography variant="small">{item.text}</Typography>
              </div>
            </div>
          ))}
        </GlassSurface>
        <GlassSurface className="about-interests">
          <div className="section-heading">
            <Typography as="h2" variant="section">
              正在关注的方向
            </Typography>
            <Code2 className="icon" aria-hidden="true" />
          </div>
          <div className="about-expertise-grid">
            {site.expertise.map((item) => (
              <div className="about-expertise" key={item.id}>
                <CategoryIcon category={item.id as Category} />
                <Typography as="h3" variant="card">
                  {item.title}
                </Typography>
                <Typography variant="small">{item.detail}</Typography>
              </div>
            ))}
          </div>
        </GlassSurface>
        <GlassSurface as="section" id="contact" className="about-contact">
          <div className="card-eyebrow">
            <span>
              <Coffee className="icon-sm" aria-hidden="true" />
              LET'S CONNECT
            </span>
            <span className="status-dot" />
          </div>
          <Typography as="h2" variant="section">
            从一句“你好”开始。
          </Typography>
          <Typography>
            欢迎技术交流、分享你的想法，或者一起探索有意思的事情。
          </Typography>
          <div className="contact-methods">
            {site.email ? (
              <div>
                <ExternalLink
                  href={`mailto:${site.email}`}
                  className="text-link"
                >
                  <Mail className="icon-sm" />
                  {site.email}
                  <ArrowUpRight className="icon-sm" />
                </ExternalLink>
                <Button
                  variant="subtle"
                  size="small"
                  onClick={() => void copy(site.email)}
                >
                  复制邮箱
                </Button>
              </div>
            ) : (
              <div>
                <Mail className="icon" aria-hidden="true" />
                <span>
                  <strong>电子邮箱</strong>
                  <span>待配置</span>
                </span>
                <Badge label="待配置" variant="secondary" />
              </div>
            )}
            {site.githubUrl ? (
              <ExternalLink href={site.githubUrl} className="text-link">
                <Code2 className="icon" />
                GitHub
                <ArrowUpRight className="icon-sm" />
              </ExternalLink>
            ) : (
              <div>
                <Code2 className="icon" aria-hidden="true" />
                <span>
                  <strong>GitHub</strong>
                  <span>待配置</span>
                </span>
                <Badge label="待配置" variant="secondary" />
              </div>
            )}
            {site.socialLinks.map((link) => (
              <ExternalLink
                href={link.url}
                key={link.label}
                className="text-link"
              >
                {link.label}
                <ArrowUpRight className="icon-sm" />
              </ExternalLink>
            ))}
          </div>
          <Typography variant="meta" className="configuration-note">
            联系方式由敏航维护。尚未填写的渠道不会生成虚构地址。
          </Typography>
        </GlassSurface>
      </div>
    </div>
  )
}
