"use client"

import { useEffect, useState } from "react"
import { Avatar, Badge, Button, IconButton, InputField } from "@figma/astraui"
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  Moon,
  Search,
  Sun,
} from "lucide-react"
import { AppLink, GlassSurface, Typography } from "../components/ui"
import { useCopy } from "../components/Feedback"
import { useHydratedTheme } from "../lib/theme"

const palette = [
  { token: "--brand-primary", label: "品牌与交互" },
  { token: "--blog-canvas", label: "环境画布" },
  { token: "--blog-glass-bg", label: "玻璃表面" },
  { token: "--blog-reading-bg", label: "阅读表面" },
  { token: "--text-primary", label: "主要文字" },
  { token: "--blog-text-muted", label: "辅助文字" },
  { token: "--blog-glass-border", label: "玻璃边缘" },
  { token: "--blog-status", label: "状态提示" },
]

export function DesignSystemPage() {
  const { theme, toggleTheme } = useHydratedTheme()
  const copy = useCopy()
  const [values, setValues] = useState<Record<string, string>>({})
  const [demoQuery, setDemoQuery] = useState("")
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const styles = getComputedStyle(document.documentElement)
      setValues(
        Object.fromEntries(
          palette.map(({ token }) => [
            token,
            styles.getPropertyValue(token).trim(),
          ]),
        ),
      )
    })
    return () => cancelAnimationFrame(frame)
  }, [theme])

  return (
    <div className="design-system-page page-enter">
      <div className="page-heading">
        <Typography variant="eyebrow">
          THE DETAILS MATTER / 设计的细节
        </Typography>
        <div className="page-title-row">
          <Typography as="h1" variant="page">
            一致，来自每一个细节<span className="heading-period">。</span>
          </Typography>
          <Badge label="Astra × Liquid Glass" variant="brand" />
        </div>
        <Typography>
          这不是一份装饰性的规范。这里展示的，就是整个博客正在使用的变量、材质与组件。
        </Typography>
      </div>
      <GlassSurface className="ds-intro">
        <span className="ds-intro-icon">
          <Code2 aria-hidden="true" />
        </span>
        <div>
          <Typography as="h2" variant="card">
            一个入口，控制整个界面。
          </Typography>
          <Typography variant="small">
            基础组件来自 Astra，玻璃材质采用 astro-liquid-glass 的公开 CSS
            子路径；颜色、间距、圆角、字体和响应式扩展统一在
            <code>styles/global.css</code>
            中管理。
          </Typography>
        </div>
        <Button
          variant="neutral"
          size="small"
          onClick={toggleTheme}
          iconStart={
            theme === "light" ? (
              <Moon className="icon-sm" />
            ) : (
              <Sun className="icon-sm" />
            )
          }
        >
          {theme === "light" ? "看看深色" : "看看浅色"}
        </Button>
      </GlassSurface>
      <section className="ds-section" aria-labelledby="ds-colors">
        <div className="section-heading">
          <Typography as="h2" variant="section" id="ds-colors">
            01 / 语义色彩
          </Typography>
          <Typography variant="meta">
            点击复制变量名 · 当前为{theme === "light" ? "浅色" : "深色"}主题
          </Typography>
        </div>
        <div className="palette-grid">
          {palette.map(({ token, label }) => (
            <GlassSurface className="palette-card" key={token}>
              <div className={`color-swatch swatch-${token.slice(2)}`} />
              <div className="palette-card-content">
                <Typography variant="small">{label}</Typography>
                <div>
                  <code>{token}</code>
                  <IconButton
                    variant="subtle"
                    size="small"
                    aria-label={`复制 ${token}`}
                    icon={<Copy className="icon-xs" />}
                    onClick={() => void copy(token)}
                  />
                </div>
                <span className="token-value" title={values[token]}>
                  {values[token] || "读取当前主题…"}
                </span>
              </div>
            </GlassSurface>
          ))}
        </div>
      </section>
      <section className="ds-section" aria-labelledby="ds-type">
        <div className="section-heading">
          <Typography as="h2" variant="section" id="ds-type">
            02 / 字体与节奏
          </Typography>
          <Typography variant="meta">
            Instrument Sans · Noto Sans SC · JetBrains Mono
          </Typography>
        </div>
        <GlassSurface className="type-specimen">
          <div>
            <span className="specimen-label">DISPLAY / 展示</span>
            <Typography variant="hero">把想法，做成现实。</Typography>
          </div>
          <div>
            <span className="specimen-label">HEADING / 标题</span>
            <Typography variant="page">保持好奇，持续构建。</Typography>
          </div>
          <div>
            <span className="specimen-label">BODY / 正文</span>
            <Typography>
              好的软件，始于一个值得解决的问题。Good ideas deserve thoughtful
              software.
            </Typography>
          </div>
          <div>
            <span className="specimen-label">CODE / 代码</span>
            <code>const curiosity = ideas.map(build); // 0123456789</code>
          </div>
          <Typography variant="meta">
            所有字体只在全局 CSS 声明，使用 400 / 500 / 600
            字重。阅读正文使用宽松行高；标题与辅助文字共享同一排版体系。
          </Typography>
        </GlassSurface>
      </section>
      <section className="ds-section" aria-labelledby="ds-material">
        <div className="section-heading">
          <Typography as="h2" variant="section" id="ds-material">
            03 / 材质与尺度
          </Typography>
          <Typography variant="meta">内容优先，材质退后一步</Typography>
        </div>
        <div className="ds-material-grid">
          <GlassSurface className="material-sample">
            <span className="material-orb" aria-hidden="true" />
            <Typography as="h3" variant="card">
              Liquid Glass / 玻璃表面
            </Typography>
            <Typography variant="small">
              半透明底色、柔和高光与背景模糊。导航、首页卡片和内容预览使用同一组材质变量。
            </Typography>
            <code>
              --blog-glass-bg
              <br />
              --blog-blur
              <br />
              --blog-radius-card
            </code>
          </GlassSurface>
          <GlassSurface variant="reading" className="material-sample">
            <Typography as="h3" variant="card">
              Reading / 阅读表面
            </Typography>
            <Typography variant="small">
              更实的表面为长文提供稳定对比度。正文区域约
              720px，不让玻璃效果干扰阅读。
            </Typography>
            <code>
              --blog-reading-bg
              <br />
              --blog-reading-max
              <br />
              --blog-leading-reading
            </code>
          </GlassSurface>
        </div>
        <GlassSurface className="spacing-specimen">
          <Typography as="h3" variant="card">
            来自 Astra 的间距与圆角
          </Typography>
          <div className="spacing-samples">
            {["xs", "sm", "md", "lg", "xl", "2xl"].map((size) => (
              <div key={size}>
                <span className={`spacing-bar spacing-${size}`} />
                <code>space-{size}</code>
              </div>
            ))}
          </div>
          <div className="radius-samples">
            <span className="radius-md">控件 / 8</span>
            <span className="radius-lg">基础 / 16</span>
            <span className="radius-card">卡片 / 32</span>
            <span className="radius-full">胶囊 / ∞</span>
          </div>
          <Typography variant="meta">
            桌面使用 12 列 Bento；768px
            起重排为两列，窄屏按内容顺序单列。卡片内边距、最大宽度与断点规则在全局
            CSS 集中定义。
          </Typography>
        </GlassSurface>
      </section>
      <section className="ds-section" aria-labelledby="ds-components">
        <div className="section-heading">
          <Typography as="h2" variant="section" id="ds-components">
            04 / 可操作的组件
          </Typography>
          <Typography variant="meta">
            真实的 Astra 组件，不是静态截图
          </Typography>
        </div>
        <div className="ds-components-grid">
          <GlassSurface className="component-sample">
            <Typography as="h3" variant="card">
              按钮与状态
            </Typography>
            <div className="demo-buttons">
              <Button onClick={() => void copy("--brand-primary")}>
                主要按钮
              </Button>
              <Button
                variant="neutral"
                onClick={() => void copy("--surface-bg")}
              >
                次要按钮
              </Button>
              <Button
                variant="subtle"
                onClick={() => void copy("--text-primary")}
              >
                轻量操作
              </Button>
              <Button disabled>不可用</Button>
              <IconButton
                aria-label="复制示例令牌"
                variant="neutral"
                icon={<Copy className="icon-sm" />}
                onClick={() => void copy("--blog-radius-card")}
              />
            </div>
            <Typography variant="meta">
              点击按钮复制相应令牌，并查看反馈。键盘焦点、禁用与悬停行为遵循
              Astra。
            </Typography>
          </GlassSurface>
          <GlassSurface className="component-sample">
            <Typography as="h3" variant="card">
              输入与反馈
            </Typography>
            <InputField
              aria-label="设计系统搜索演示"
              prefix={<Search className="icon-sm" />}
              placeholder="输入一些文字，试试看…"
              value={demoQuery}
              onChange={setDemoQuery}
            />
            <Typography variant="small" aria-live="polite">
              {demoQuery
                ? `你输入了：${demoQuery}`
                : "输入状态仅保存在此演示中。"}
            </Typography>
            <div className="demo-badges">
              <Badge label="技术标签" variant="secondary" />
              <Badge label="重点内容" variant="brand" />
              <Badge label="已完成" variant="success" />
              <Avatar type="initial" initials="敏" size="medium" />
              <Check className="icon-sm" aria-hidden="true" />
            </div>
          </GlassSurface>
        </div>
      </section>
      <GlassSurface className="source-package">
        <div>
          <Typography variant="eyebrow">
            BUILT WITH CARE / 资源与边界
          </Typography>
          <Typography as="h2" variant="section">
            开放分享，也尊重内容的边界。
          </Typography>
          <Typography variant="small">
            本站由 Next.js 与 Payload 驱动。完整 Astro
            源码资料仅向授权后台成员提供，
            不作为公共静态文件分发，也不等同于当前站点的源码导出。
          </Typography>
        </div>
        <AppLink
          to="/admin/collections/protected-downloads"
          className="button-link button-link--primary"
        >
          <ArrowDownToLine className="icon-sm" aria-hidden="true" />
          后台授权资源
        </AppLink>
      </GlassSurface>
      <div className="page-note">
        <AppLink to="/" className="text-link">
          回到首页，看看这些细节如何组合
          <ArrowUpRight className="icon-sm" />
        </AppLink>
      </div>
    </div>
  )
}
