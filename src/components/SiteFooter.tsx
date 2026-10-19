import { Atom, ArrowUpRight } from "lucide-react"
import { useSiteContent } from "./SiteContext"
import { AppLink } from "./ui"

export function SiteFooter() {
  const site = useSiteContent()
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <span>
          © {new Date().getFullYear()} {site.siteTitle}
          <span className="footer-separator">/</span>保持好奇，持续构建。
        </span>
        <div className="footer-links">
          <AppLink to="/about#contact">
            联系我
            <ArrowUpRight className="icon-xs" aria-hidden="true" />
          </AppLink>
          <AppLink to="/design-system">设计系统</AppLink>
        </div>
      </div>
      <div className="footer-bottom">
        <span>用热爱编写，为分享而存在。</span>
        <span className="powered-by">
          <Atom className="icon-sm" aria-hidden="true" /> Powered by React
        </span>
      </div>
    </footer>
  )
}
