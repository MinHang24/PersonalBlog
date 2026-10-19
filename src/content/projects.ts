import type { Project } from "./types"

export const projects: Project[] = [
  {
    id: "hongguo-manju-pc",
    title: "红果漫剧 PC 客户端",
    description:
      "把小屏的精彩，带到桌面。围绕内容发现、阅读节奏与桌面交互，探索一款更专注、更舒适的漫剧客户端。",
    tags: ["Go", "Wails", "TypeScript", "桌面应用"],
    featured: true,
    isSample: false,
    articleSlug: "hongguo-manju-desktop-notes",
    highlights: [
      "为大屏重新组织内容层级，而不只是放大移动端。",
      "探索键盘操作、窗口状态与连续浏览的体验。",
      "将界面层和本地能力分离，保持工程边界清晰。",
    ],
  },
  {
    id: "go-worker-queue",
    title: "Go 并发任务队列",
    description:
      "一个从任务接收、并发限制到取消与优雅退出的工程练习。让并发不仅跑得快，也能够被理解、被控制。",
    tags: ["Go", "Context", "并发"],
    featured: false,
    isSample: true,
    articleSlug: "go-worker-pool",
    highlights: [
      "有界队列和明确的背压。",
      "在任务边界传递取消信号。",
      "通过指标而不是猜测决定并发度。",
    ],
  },
  {
    id: "rust-media-toolkit",
    title: "Rust 媒体工具箱",
    description:
      "使用 Rust 组织命令行接口，以 FFmpeg 完成媒体处理。关注错误上下文、临时文件管理和可重试的任务。",
    tags: ["Rust", "FFmpeg", "CLI"],
    featured: false,
    isSample: true,
    articleSlug: "ffmpeg-media-pipeline",
    highlights: [
      "显式的处理阶段与错误类型。",
      "以可验证的产物判断任务结果。",
      "把媒体能力组合成简单、可复用的工具。",
    ],
  },
]
