"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { IconButton, InputField, Modal, Tooltip } from "@figma/astraui"
import {
  ArrowUpRight,
  Command,
  Menu,
  Moon,
  Search,
  Sun,
  Terminal,
  X,
} from "lucide-react"
import { navigation } from "../lib/navigation"
import { useSiteContent } from "./SiteContext"
import type { ArticleSummary } from "@/lib/content/dto"
import { useHydratedTheme } from "../lib/theme"
import { searchArticles, categoryLabel } from "../lib/articles"
import { AppLink, Typography } from "./ui"

export function SiteHeader({ articles }: { articles: ArticleSummary[] }) {
  const site = useSiteContent()
  const { theme, toggleTheme } = useHydratedTheme()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const menuTrigger = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !event.isComposing
      ) {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false)
        menuTrigger.current?.querySelector("button")?.focus()
      }
    }
    window.addEventListener("keydown", keydown)
    return () => window.removeEventListener("keydown", keydown)
  }, [menuOpen])

  return (
    <>
      <AppLink to="#main-content" className="skip-link">
        跳到主要内容
      </AppLink>
      <header className="site-header">
        <div className="header-inner">
          <AppLink
            to="/"
            className="brand"
            aria-label={`${site.siteTitle}，返回首页`}
          >
            <span className="brand-mark">
              <Terminal aria-hidden="true" />
            </span>
            <span className="brand-name">
              {site.siteTitle}
              <span className="brand-subtitle">{site.siteSubtitle}</span>
            </span>
          </AppLink>
          <nav className="desktop-navigation" aria-label="主导航">
            {navigation.map((item) => (
              <AppLink
                key={item.to}
                to={item.to}
                aria-current={
                  (
                    item.end
                      ? pathname === item.to
                      : pathname === item.to ||
                        pathname.startsWith(`${item.to}/`)
                  )
                    ? "page"
                    : undefined
                }
                className={`nav-link ${
                  (
                    item.end
                      ? pathname === item.to
                      : pathname === item.to ||
                        pathname.startsWith(`${item.to}/`)
                  )
                    ? "is-active"
                    : ""
                }`}
              >
                {item.label}
              </AppLink>
            ))}
          </nav>
          <div className="header-actions">
            <Tooltip content="搜索文章 · Ctrl / ⌘ K" position="bottom">
              <IconButton
                className="header-search"
                variant="subtle"
                aria-label="搜索文章"
                onClick={() => setSearchOpen(true)}
                icon={<Search className="icon" aria-hidden="true" />}
              />
            </Tooltip>
            <span className="header-action-divider" aria-hidden="true" />
            <AppLink
              to="/admin"
              className="nav-link !hidden xl:!inline-flex"
              aria-label="进入敏航内容工作台"
            >
              工作台
            </AppLink>
            <Tooltip
              content={theme === "light" ? "切换深色主题" : "切换浅色主题"}
              position="bottom"
            >
              <IconButton
                variant="subtle"
                aria-label={theme === "light" ? "切换深色主题" : "切换浅色主题"}
                onClick={toggleTheme}
                icon={
                  theme === "light" ? (
                    <Moon className="icon" aria-hidden="true" />
                  ) : (
                    <Sun className="icon" aria-hidden="true" />
                  )
                }
              />
            </Tooltip>
            <span ref={menuTrigger} className="mobile-menu-trigger">
              <IconButton
                variant="subtle"
                aria-label={menuOpen ? "关闭导航菜单" : "打开导航菜单"}
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setMenuOpen(!menuOpen)}
                icon={
                  menuOpen ? <X className="icon" /> : <Menu className="icon" />
                }
              />
            </span>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="mobile-navigation"
            aria-label="移动端主导航"
          >
            {navigation.map((item) => (
              <AppLink
                key={item.to}
                to={item.to}
                aria-current={
                  (
                    item.end
                      ? pathname === item.to
                      : pathname === item.to ||
                        pathname.startsWith(`${item.to}/`)
                  )
                    ? "page"
                    : undefined
                }
                className={`nav-link ${
                  (
                    item.end
                      ? pathname === item.to
                      : pathname === item.to ||
                        pathname.startsWith(`${item.to}/`)
                  )
                    ? "is-active"
                    : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                <ArrowUpRight className="icon-sm" aria-hidden="true" />
              </AppLink>
            ))}
            <AppLink to="/admin" className="nav-link">
              内容工作台
              <ArrowUpRight className="icon-sm" />
            </AppLink>
          </nav>
        )}
      </header>
      <Modal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="搜索手记"
        size="large"
        className="search-modal"
      >
        <InputField
          aria-label="搜索文章标题、摘要和标签"
          placeholder="搜索文章、技术或一个想法…"
          prefix={<Search className="icon-sm" aria-hidden="true" />}
          value={query}
          onChange={setQuery}
          autoFocus
        />
        <div className="search-results" aria-live="polite">
          <Typography variant="meta">
            {query.trim()
              ? `找到 ${searchArticles(articles, query).length} 篇相关文章`
              : "从这里开始探索"}
          </Typography>
          {searchArticles(articles, query)
            .slice(0, 6)
            .map((article) => (
              <AppLink
                key={article.slug}
                to={`/blog/${article.slug}`}
                onClick={() => setSearchOpen(false)}
                className="search-result"
              >
                <span>
                  <span
                    className={`category-label category-${article.category}`}
                  >
                    {categoryLabel(article.category)}
                  </span>
                  <span className="search-result-title">{article.title}</span>
                </span>
                <ArrowUpRight className="icon-sm" aria-hidden="true" />
              </AppLink>
            ))}
          {searchArticles(articles, query).length === 0 && (
            <Typography variant="small">
              没有找到相关文章，试试 Go、Rust 或“桌面”。
            </Typography>
          )}
        </div>
        <div className="search-help">
          <span>搜索标题、摘要与标签</span>
          <span>
            <Command className="icon-xs" aria-hidden="true" /> K 打开 · Esc 关闭
          </span>
        </div>
      </Modal>
    </>
  )
}
