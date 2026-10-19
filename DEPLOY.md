# Cloudflare Pages 部署全流程（详细版）

> 项目：PersonalBlog（Next.js 16 + Payload CMS，OpenNext 适配 Cloudflare）
> 目标：把博客部署到你购买的域名

---

## 📋 前置准备

| 项 | 说明 |
|----|------|
| Cloudflare 账号 | https://dash.cloudflare.com 注册（免费版够用） |
| 域名 | 你已购买 ✅ |
| Node.js 20+ | 本地构建用 |

---

## 🚀 第一步：本地构建（已完成）

```bash
cd "F:\Figma\Personal Blog Prototype"

# 安装 OpenNext 适配器（已完成）
npx pnpm add -D @opennextjs/cloudflare wrangler

# 构建（生成 .open-next/ 产物）
npx opennextjs-cloudflare build
```

**构建产物**：`.open-next/` 目录（Cloudflare Workers 运行时格式）

---

## 🌐 第二步：登录 Cloudflare

### 方式 A：命令行（wrangler，推荐）

```bash
npx wrangler login
```
- 会自动打开浏览器 → 登录 Cloudflare 账号 → **Allow** 授权

### 方式 B：API Token（CI/CD 用）

1. https://dash.cloudflare.com/profile/api-tokens
2. **Create Token** → 模板选 **Cloudflare Pages:Edit**
3. 复制 token，设置环境变量：
```bash
export CLOUDFLARE_API_TOKEN=你的token
export CLOUDFLARE_ACCOUNT_ID=你的account_id   # Dashboard 右侧栏可见
```

---

## 📦 第三步：部署到 Cloudflare Pages

### 方式 A：命令行一键部署

```bash
npx wrangler pages deploy .open-next/cloudflare
```

首次会提示：
- **Create a new project** → 输入项目名（如 `personal-blog`）
- 选择组织/账号

部署完成后会输出 URL：`https://personal-blog.pages.dev`

### 方式 B：Dashboard 手动部署

1. 登录 https://dash.cloudflare.com
2. 左侧 **Workers & Pages** → **Create** → **Pages** tab
3. **Upload assets**（直接上传）或 **Connect to Git**（连接 GitHub）
4. 配置：
   - **Project name**：`personal-blog`
   - **Build command**：`npm run build`
   - **Build output directory**：`.open-next/cloudflare`
5. **Save and Deploy**

### 方式 C：Git 集成（自动部署，推荐长期用）

1. Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub → 选择仓库 `MinHang24/PersonalBlog`
3. 构建配置：
   ```
   Framework preset: Next.js
   Build command: npx opennextjs-cloudflare build
   Build output directory: .open-next/cloudflare
   Root directory: （留空）
   ```
4. **Save and Deploy**
5. 以后 `git push` 自动触发部署 ✅

---

## 🌍 第四步：绑定你的域名

### 4.1 把域名接入 Cloudflare（DNS 托管）

> 如果域名是在阿里云/腾讯云/Namecheap 等买的，需要把 **Nameservers 改成 Cloudflare 的**

1. Dashboard → **Add a site** → 输入你的域名（如 `minhang.com`）
2. 选 **Free** 计划 → **Continue**
3. Cloudflare 会扫描现有 DNS 记录 → **Continue**
4. **复制 Cloudflare 给的两个 Nameservers**（如 `xxx.ns.cloudflare.com`）
5. 去**域名注册商**（买域名的地方）→ 域名管理 → **修改 Nameservers** → 粘贴这两个
6. 回 Cloudflare → **Check nameservers**（生效约 5 分钟~24 小时）

### 4.2 在 Pages 项目绑定域名

1. Workers & Pages → 你的项目（`personal-blog`）→ **Custom domains** tab
2. **Set up a custom domain** → 输入：
   - **主域名**：`minhang.com`（裸域）
   - **www**：`www.minhang.com`（可选）
3. Cloudflare 自动添加 DNS 记录（CNAME/A）→ **Activate domain**
4. **HTTPS 自动配置**（免费 SSL 证书，几分钟生效）

---

## ⚙️ 第五步：环境变量（可选）

Pages 项目 → **Settings** → **Environment variables**：

| 变量 | 值 | 说明 |
|------|-----|------|
| `NODE_ENV` | `production` | 生产模式 |

（当前构建是纯静态内容，无运行时密钥需求）

---

## ✅ 第六步：验证

1. 访问 `https://personal-blog.pages.dev`（默认域名）
2. 访问 `https://minhang.com`（你的域名）
3. 检查页面：
   - [ ] 首页加载
   - [ ] 博客列表 + 文章详情
   - [ ] 项目页（3 个项目）
   - [ ] HTTPS 证书有效（锁标志）
   - [ ] 移动端适配

---

## 🔄 日常更新流程

```bash
# 1. 改代码/内容（src/content/ 下改文章、项目）
# 2. 本地预览（可选）
npx next dev

# 3. 构建
npx opennextjs-cloudflare build

# 4. 部署
npx wrangler pages deploy .open-next/cloudflare

# 或 Git 集成模式：直接 push
git add -A && git commit -m "update content" && git push
```

---

## 🛠️ 常见问题

**Q：部署后页面 404？**
检查 `Build output directory` 是否为 `.open-next/cloudflare`

**Q：域名不生效？**
- Nameservers 修改后等生效（最长 24h）
- 用 `nslookup 你的域名` 看解析是否指向 Cloudflare

**Q：HTTPS 证书错误？**
Pages 项目 → Custom domains → 等证书签发（几分钟）

**Q：构建失败？**
- 确认 Node 20+：`node -v`
- 确认环境变量已设（构建时的 FIGMA_* 变量）

---

## 📞 有用的链接

- Cloudflare Dashboard: https://dash.cloudflare.com
- Pages 文档: https://developers.cloudflare.com/pages
- OpenNext 文档: https://opennext.js.org/docs
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler
