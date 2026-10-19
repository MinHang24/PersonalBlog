# 敏航的手记 · Personal Blog

> MINHANG / NOTES —— 把想法，做成好用的软件。

个人博客（Figma 设计原型 → 代码），基于 **Next.js 16 + Payload CMS** 构建，配置为静态导出（`output: "export"`），可直接部署到 **Cloudflare Pages**。

## ✨ 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 16（App Router + Turbopack） |
| UI | React 19 + Tailwind CSS |
| 内容 | 本地 TypeScript 内容源（`src/content/`） |
| 部署 | 静态导出（Cloudflare Pages / 任意静态托管） |

## 📂 目录结构

```
src/
├── app/(frontend)/     # 页面路由（首页/关于/博客/项目）
├── components/         # UI 组件
├── content/            # 内容（文章/项目/站点设置）
├── lib/content/        # 内容查询层（静态固化）
└── views/              # 页面视图
```

## 🚀 开发

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## 📦 构建 & 部署

```bash
npx next build  # 产物在 out/ 目录
```

部署到 Cloudflare Pages：
1. Cloudflare Dashboard → Pages → Create project
2. 上传 `out/` 目录（或连接 Git 仓库自动构建）
3. Build command: `npx next build`，Output directory: `out`

## 📝 内容管理

所有内容在 `src/content/`（TypeScript 文件）：
- `site.ts` — 站点设置（标题/简介/技能）
- `articles/` — 博客文章
- `projects.ts` — 项目展示

修改后重新 build 即可。
