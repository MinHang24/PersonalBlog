import type { Article } from "../types"

export const article: Article = {
  slug: "hongguo-manju-desktop-notes",
  title: "红果漫剧 PC 客户端：桌面交互设计笔记",
  excerpt:
    "从小屏到桌面，不只是放大。关于内容层级、键盘体验和跨平台边界的一次设计探索。",
  category: "desktop",
  tags: ["Wails", "Go", "交互设计"],
  publishedAt: "2025-06-03",
  blocks: [
    {
      kind: "paragraph",
      content: [
        "这是一份围绕红果漫剧 PC 客户端的示例设计笔记，记录如何把以内容消费为中心的体验带到桌面。文中的界面构图属于设计示意，不代表已经发布的功能、版本或官方客户端。我们关注的是方法：如何利用更宽的空间，又不让界面变得复杂。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "desktop-not-enlarged-mobile",
      text: "桌面不是放大的移动端",
    },
    {
      kind: "paragraph",
      content: [
        "手机界面的连续信息流适合单手浏览，但在大屏上直接拉宽，会让视线移动距离过长。桌面可以把导航、内容网格与阅读区域分开：固定导航提供方位，适当宽度的内容区保持节奏，次要操作则在需要时出现。空间更多，不意味着应该同时展示更多信息。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "优先确定三个核心动作：发现内容、继续观看、回到收藏。它们需要稳定的位置和明确的视觉层级。搜索、设置与账户等辅助操作不应抢占主要阅读空间。窗口变窄时，布局应该自然减少列数，而不是依赖横向滚动来维持一张缩小的桌面画布。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "keyboard-and-focus",
      text: "把键盘与焦点作为一等公民",
    },
    {
      kind: "paragraph",
      content: [
        "鼠标悬停可以提供精细反馈，但桌面体验不能只为鼠标设计。导航和卡片需要可见的键盘焦点，返回操作应当回到原来浏览的位置。模态窗口关闭后恢复触发点焦点，搜索快捷键不能在输入中文时误触发。明确的焦点顺序，比增加更多快捷键更重要。",
      ],
    },
    {
      kind: "list",
      items: [
        ["主要路径保持清晰的 Tab 顺序。"],
        ["返回列表时恢复滚动和筛选状态。"],
        ["宽窗口利用网格，窄窗口保持单列可读。"],
        ["空内容、加载和失败状态使用不同的说明。"],
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "frontend-native-boundary",
      text: "让本地能力留在清楚的边界里",
    },
    {
      kind: "paragraph",
      content: [
        "采用 Go 与 Wails 的组合时，界面负责呈现与交互，本地层负责受约束的系统能力。不要让组件直接拼接文件系统路径或执行任意命令。跨边界的数据使用明确结构，并在本地层再次验证。界面错误需要翻译成用户能理解的信息，底层诊断则保留必要上下文。",
      ],
    },
    {
      kind: "code",
      language: "typescript",
      code: 'type WindowPreferences = {\n  width: number\n  height: number\n  maximized: boolean\n  theme: "light" | "dark" | "system"\n}\n\nfunction restoreSize(saved: WindowPreferences) {\n  return {\n    width: Math.max(800, saved.width),\n    height: Math.max(600, saved.height),\n  }\n}',
    },
    {
      kind: "heading",
      level: 2,
      id: "calm-material",
      text: "玻璃材质应该服务于内容",
    },
    {
      kind: "paragraph",
      content: [
        "半透明表面可以传达层次，但正文和内容标题仍然需要稳定对比度。模糊只放在有限的导航与卡片层，不叠加无限多重透明面板。系统要求减少动态效果或增强对比度时，应当降低材质复杂度。不能让“看起来轻盈”变成“文字难以辨认”。",
      ],
    },
    {
      kind: "quote",
      content: [
        "好的桌面适配，不是把移动端所有东西放进一个更大的窗口，而是重新理解这块空间。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "这份探索不把尚未完成的功能写成成果。先验证最常用的浏览路径，再逐步补齐状态与边界，才能让一个有吸引力的构想成为真正耐用的软件。",
      ],
    },
  ],
}
