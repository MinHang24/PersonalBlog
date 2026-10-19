import {
  Bookmark,
  ChevronRight,
  Home,
  Monitor,
  Play,
  Search,
} from "lucide-react"

export function DesktopPreview() {
  return (
    <div
      className="desktop-preview"
      role="img"
      aria-label="红果漫剧桌面客户端的原创界面示意，非产品截图"
    >
      <div className="preview-grid" aria-hidden="true" />
      <div className="preview-window" aria-hidden="true">
        <div className="window-titlebar">
          <span className="window-dots">
            <i />
            <i />
            <i />
          </span>
          <span>红果漫剧</span>
          <span className="window-actions">—　□　×</span>
        </div>
        <div className="window-body">
          <div className="window-sidebar">
            <span className="mini-logo">
              <Play />
            </span>
            <Home />
            <Bookmark />
            <Monitor />
          </div>
          <div className="window-content">
            <div className="window-navigation">
              <span className="window-tab-active">发现</span>
              <span>我的收藏</span>
              <span className="window-search">
                <Search />
              </span>
            </div>
            <div className="window-heading">
              <span>让故事，陪你片刻。</span>
              <span>
                精选推荐 <ChevronRight />
              </span>
            </div>
            <div className="poster-grid">
              <div className="mock-poster poster-one">
                <span className="poster-orbit" />
                <div>
                  <span>山海之间</span>
                  <small>每一次相遇，都是新的篇章</small>
                </div>
              </div>
              <div className="mock-poster poster-two">
                <span className="poster-orbit" />
                <div>
                  <span>追光的人</span>
                  <small>关于热爱与勇气的故事</small>
                </div>
              </div>
              <div className="mock-poster poster-three">
                <span className="poster-orbit" />
                <div>
                  <span>城市来信</span>
                  <small>在平凡里，遇见不平凡</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="preview-caption">原创界面示意 · 非产品截图</span>
    </div>
  )
}
