import type { Article } from "../types"

export const article: Article = {
  slug: "desktop-state-persistence",
  title: "桌面应用的窗口状态与本地配置",
  excerpt:
    "记住窗口，不记住错误。用版本、校验和安全默认值，让下次打开的体验依然可靠。",
  category: "desktop",
  tags: ["桌面应用", "本地配置", "工程实践"],
  publishedAt: "2025-05-08",
  blocks: [
    {
      kind: "paragraph",
      content: [
        "记住上次的窗口大小，看起来是一个很小的功能。但换了显示器、调整系统缩放或拔掉外接屏幕后，原来的坐标可能让窗口彻底消失。持久化状态的目标不是原样恢复每一个数字，而是在新的环境里恢复用户的意图。这需要校验、回退和明确的数据边界。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "separate-state",
      text: "区分偏好、会话与派生状态",
    },
    {
      kind: "paragraph",
      content: [
        "主题和阅读选项是用户偏好，当前打开的页面属于会话状态，设备可用区域则是环境数据。不要把它们混在一个随时被覆盖的大对象中。偏好可以长期保存，会话可以过期，派生状态则应在启动时重新计算。这样升级或清理时才知道哪些数据值得保留。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "validate-on-read",
      text: "读取配置时重新建立信任",
    },
    {
      kind: "paragraph",
      content: [
        "本地文件同样是不可信的输入：可能被手动编辑、只写了一半，或者来自旧版本。解析成功不代表数据有效，需要逐字段检查类型、范围与枚举。无效字段回到默认值，而不是让整个应用启动失败。涉及路径或系统操作的配置，还要在执行边界再次验证。",
      ],
    },
    {
      kind: "code",
      language: "typescript",
      code: 'type Preferences = {\n  version: 1\n  theme: "light" | "dark" | "system"\n  window: { width: number; height: number }\n}\n\nfunction validDimension(value: unknown, fallback: number) {\n  return typeof value === "number" && Number.isFinite(value)\n    ? Math.min(3840, Math.max(600, value))\n    : fallback\n}',
    },
    {
      kind: "paragraph",
      content: [
        "恢复窗口位置前，要检查它与当前任意显示器是否存在足够的交集。如果没有，就把窗口放到主屏的可见区域。最大化状态应该单独保存，避免把最大化时的尺寸误当成普通窗口尺寸。不同平台的窗口边框与缩放行为也需要各自验证。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "safe-writes",
      text: "把写入变成一个完整动作",
    },
    {
      kind: "paragraph",
      content: [
        "频繁的窗口变化事件不应该每次都写磁盘。使用防抖合并更新，在退出时刷新最后一次状态。文件存储可以先写临时文件，再通过同一文件系统中的重命名替换正式文件，降低中途退出留下半个 JSON 的风险。需要注意原子替换行为在不同平台上的差异。",
      ],
    },
    {
      kind: "list",
      items: [
        ["数据结构包含明确的版本号。"],
        ["读取后校验，缺失字段使用稳定默认值。"],
        ["写入有节流，不阻塞关键交互。"],
        ["保存失败有诊断信息，但不让窗口无法关闭。"],
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "migration",
      text: "升级时迁移意图，而不是堆积兼容分支",
    },
    {
      kind: "paragraph",
      content: [
        "当配置结构变化时，集中编写从旧版本到新版本的迁移函数。迁移应该是可测试的纯转换，处理后再统一校验。不要让每个界面组件分别理解所有历史版本。对无法识别的未来版本保留原文件，并使用安全默认值，避免旧程序覆盖新程序的数据。",
      ],
    },
    {
      kind: "quote",
      content: [
        "可靠的持久化，不是永远保存成功，而是即使保存失败，用户也能再次正常打开应用。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "好的默认值、清晰的数据分类和独立的迁移层，让一个看似琐碎的小功能拥有可预测的行为。真正值得记住的是使用习惯，而不是上一次运行环境中的所有细节。",
      ],
    },
  ],
}
