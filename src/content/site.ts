interface SocialLink {
  label: string
  url: string
}

export const site = {
  siteTitle: "敏航的手记",
  siteSubtitle: "MINHANG / NOTES",
  authorName: "敏航",
  initials: "敏",
  avatarUrl: "",
  tagline: "把想法，做成好用的软件。",
  bio: "我是敏航，喜欢把想法变成现实。关注 Go、Rust、音视频技术与跨平台桌面应用，在这里分享实践、思考，以及构建过程中的小小发现。",
  email: "",
  githubUrl: "",
  socialLinks: [] as SocialLink[],
  expertise: [
    {
      id: "go",
      title: "Go",
      description: "简单，也可以很强大",
      detail: "并发模型、服务端架构与可靠的工程实践。",
    },
    {
      id: "rust",
      title: "Rust",
      description: "安全与性能的平衡",
      detail: "所有权、系统编程与可靠的命令行工具。",
    },
    {
      id: "multimedia",
      title: "音视频",
      description: "让每一帧恰到好处",
      detail: "FFmpeg、媒体处理流水线与音视频同步。",
    },
    {
      id: "desktop",
      title: "桌面应用",
      description: "把体验带到大屏幕",
      detail: "Wails、Tauri 与跨平台交互设计。",
    },
  ],
  techStack: [
    { name: "Go", kind: "go", note: "并发与服务" },
    { name: "Rust", kind: "rust", note: "安全与性能" },
    { name: "TypeScript", kind: "desktop", note: "清晰的界面逻辑" },
    { name: "FFmpeg", kind: "multimedia", note: "音视频处理" },
    { name: "Wails", kind: "desktop", note: "轻盈的桌面应用" },
    { name: "Tauri", kind: "rust", note: "跨平台的新可能" },
  ],
}
