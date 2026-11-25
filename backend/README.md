> 当前架构：启动类为 `com.minhang.Application`，分层、对象职责、Bean 管理和扩展步骤见 [ARCHITECTURE.md](ARCHITECTURE.md)。采用 Spring IoC + 阿里 Java 开发规范的分层习惯，保留现有接口与数据库结构。
>
> 默认 Maven profile 为 dev（H2），生产使用 prod（PostgreSQL），切换方式见下文。测试使用隔离的内存 H2，不需要生产口令。建议 JDK 17/21。以下迁移记录保留作背景，当前代码与配置以本节和架构文档为准。

## 开发 / 生产配置切换

`application.properties` 仅放公共配置及 Maven 过滤生成的默认环境；环境配置分别在 `application-dev.properties` 和 `application-prod.properties`。原 `application-postgres.properties` 已合并到 prod，不再使用 postgres profile。

| 项目 | dev（开发，默认） | prod（生产） |
| --- | --- | --- |
| 数据库 | 本地 H2 文件 | PostgreSQL，连接信息由环境变量提供 |
| 表结构 | Hibernate update | Hibernate validate，不自动修改表 |
| 初始化内容 | 默认空库导入，可关闭 | 默认不导入 |
| 会话 Cookie | 允许本地 HTTP | Secure，需 HTTPS |
| 管理员密码 | BLOG_ADMIN_PASSWORD，至少 16 字符 | 同左，不内置口令 |

在 backend 目录执行：

```shell
mvn -Pdev clean verify
python scripts/check-packaged-profile.py dev
mvn -Pdev spring-boot:run

mvn -Pprod clean verify
python scripts/check-packaged-profile.py prod
java -jar target/backend-1.0.0.jar
```

生产启动前设置 `DATABASE_URL`、`DATABASE_USER`、`DATABASE_PASSWORD`、`BLOG_ADMIN_PASSWORD`，并按 `database/postgresql/README.md` 创建数据库和表。构建和测试不需要这些生产凭据。配置文件中的 `${...}` 留到运行时解析，不会把构建机器的凭据写进 JAR。

IDEA：重新加载 Maven 项目，在 Maven 面板的 Profiles 中只勾选 dev 或 prod，然后执行 `clean verify`。环境切换务必 clean，避免上一次构建的环境文件残留。IDEA 直接运行主类前，先运行选定环境的 Maven `process-resources`（切换时用 `clean process-resources`），让 `@runtime.profile@` 被替换。Maven profile 决定构建默认值；如运行配置设置了 `SPRING_PROFILES_ACTIVE`，它会优先覆盖默认值，应清除过期的 postgres/dev 设置。

每个构建产物只包含当前环境文件：prod 包不带 dev 配置，反之亦然。不要给 prod 包强行指定 dev profile；换环境应重新构建。测试始终显式激活 test，独立于构建的 dev/prod 选择。

## release 分支自动生产构建

GitHub Actions 工作流位于 `.github/workflows/backend-release.yml`：PR 指向 release 时执行生产构建验证；合并或推送到 release 后自动执行 `mvn -Pprod clean verify`，检查 JAR 确实只有 prod 环境，再上传生产 JAR 到该次 Actions 的 Artifacts。

自动切换发生在 **GitHub release 分支的 CI 构建**，不修改源码、不向分支提交配置切换，也不自动部署服务器。本地仅 checkout/merge 到 release 不会自动改变 Maven profile，本地构建仍应明确使用 `-Pprod`。工作流需要随代码提交并推送到 GitHub，且仓库启用 Actions 才会生效。

# Spring 后端与迁移记录

技术选择：保留 React / Next.js，新增 Java 17+、Spring Boot 3.5.16、Spring Security、JPA。Vue 与 React 是替代方案，未重复引入 Vue。推荐 JDK 21；本机 Maven 使用 JDK 26，测试能运行但不在 Spring Boot 3.5 官方支持范围内。

## 启动

在 backend 目录设置 BLOG_ADMIN_PASSWORD（至少16字符，不提交到仓库），运行 `mvn spring-boot:run`。端口默认8080。管理员用户名 admin，访问 http://localhost:8080/index.html 使用 HTTP Basic 登录。公网部署必须通过 HTTPS 反向代理。

前端启动时设置 `BLOG_API_URL=http://localhost:8080`，然后在项目根目录 `pnpm dev`。未设置变量时保留原有静态数据。前端服务端请求 API，不需要浏览器跨域权限。动态页面不适用于原来的静态导出部署流程。

开发 dev 默认使用 H2 文件库，空库导入 seed.json，可用 BLOG_SEED_ENABLED=false 关闭。生产 prod 使用 PostgreSQL 和 Hibernate validate，默认关闭初始化；测试使用独立 test profile。正式生产还应补充版本化数据库迁移。

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
