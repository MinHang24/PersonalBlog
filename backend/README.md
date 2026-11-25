> PostgreSQL 更新：后端现默认使用 PostgreSQL，请先按 `database/postgresql/README.md` 执行建表并设置数据库凭据。下方早期交付记录中的默认 H2 描述已被替代；H2 仅供显式开发配置使用。

# Spring 后端与迁移记录

技术选择：保留 React / Next.js，新增 Java 17+、Spring Boot 3.5.16、Spring Security、JPA。Vue 与 React 是替代方案，未重复引入 Vue。推荐 JDK 21；本机 Maven 使用 JDK 26，测试能运行但不在 Spring Boot 3.5 官方支持范围内。

## 启动

在 backend 目录设置 BLOG_ADMIN_PASSWORD（至少16字符，不提交到仓库），运行 `mvn spring-boot:run`。端口默认8080。管理员用户名 admin，访问 http://localhost:8080/index.html 使用 HTTP Basic 登录。公网部署必须通过 HTTPS 反向代理。

前端启动时设置 `BLOG_API_URL=http://localhost:8080`，然后在项目根目录 `pnpm dev`。未设置变量时保留原有静态数据。前端服务端请求 API，不需要浏览器跨域权限。动态页面不适用于原来的静态导出部署流程。

默认数据库为 backend/data/blog 的 H2 文件。首次空库启动导入 seed.json；之后不覆盖编辑过的数据。备份请停服务后备份整个 data 目录。PostgreSQL 可通过 DATABASE_URL、DATABASE_USER、DATABASE_PASSWORD 指定；当前使用 Hibernate update，正式生产应补充版本化数据库迁移。

## 需求与完成范围

已实现：文章、项目、站点信息持久化；文章标题搜索、分类过滤、分页；草稿与公开内容隔离；管理员创建、修改、删除；唯一固定链接；乐观锁冲突保护；CSRF 防护；原有内容首次导入；独立 JSON 编辑管理页面；前端可切换 Spring 数据源。

接口：GET /api/public/{posts|projects|settings}，GET /api/public/{kind}/{slug}；站点设置固定 slug 为 site。列表参数 q、category、page（从0起）、size（1至100）。管理员 GET/POST /api/admin/{kind}，PUT/DELETE /api/admin/{kind}/{slug}。写入 JSON 为 {slug,title,published,data,version}；修改携带当前 version，删除携带 ?version=当前值。先 GET /api/csrf 获取令牌和会话 Cookie，写请求携带返回的 headerName/token。健康检查 /api/health。

尚未迁移：Payload 可视化富文本工作台、媒体上传/受保护下载、标签独立管理、版本历史、审计日志、多个管理员与角色。现在的管理页面直接编辑 DTO JSON，不等同于原设计后台；不能称作全部后台需求完成。原有静态 DTO 转换器会简化富文本，seed.json 保留 blocks 供后续完整转换。生产发布前还需完整 UI 联调与数据库迁移方案。

## 合并判断

ZIP 和现有仓库的主体内容一致。ZIP 有新版 admin 工作台和 Figma 路由，现有仓库已改成普通 src/app 路由并使用静态查询，直接覆盖会产生重复路由并恢复 Figma 云依赖。因此仅增量合入 backend 和 Spring 查询适配，未覆盖 Payload 源文件及现有部署配置。修改前文件保存在 migration-backup-20261125。ZIP 后台视觉更新暂未合入。

Next.js 从16.4.0更新到16.4.6，React/react-dom从19.2.1更新到19.3.1；实际版本并非14.0。安全版本应持续通过 npm registry 与官方公告核查。

## 本次验证

- Next.js 16.4.6 production build 通过；原有配置跳过类型检查，因此另行执行 tsc --noEmit，通过。
- Maven package 通过；2项集成测试覆盖匿名写入拒绝、管理端认证、草稿隐藏、分页校验、版本冲突、发布、重复 slug 和删除。
- 前端 production build 本次使用静态回退数据；正式接入必须在构建及运行阶段都设置 BLOG_API_URL，尚未进行浏览器端完整验收。
