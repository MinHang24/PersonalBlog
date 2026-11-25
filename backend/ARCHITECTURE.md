# CMS 后端架构

本项目采用模块化单体：Java 17 语言基线、Spring Boot 3、Spring Security、Spring Data JPA。按阿里 Java 开发规范的对象命名和分层习惯组织，Bean 的生命周期、依赖注入、事务代理由 Spring IoC 管理。这里不需要 Spring Cloud Alibaba，也未引入第二套容器。

## 包结构与依赖

```text
com.minhang
├── Application
├── controller
│   ├── content             公开内容接口、管理内容接口
│   └── system              健康检查、CSRF
├── service
│   ├── content             服务接口、impl 实现、policy 策略注册
│   ├── post                文章业务规则
│   ├── project             项目业务规则
│   └── setting             站点设置业务规则
├── mapper/content          JPA 持久化访问
├── bean/content
│   ├── dto                 ContentSaveDTO：HTTP 输入及字段校验
│   ├── bo                  ContentSaveBO、ContentQueryBO、ContentPublicBO
│   ├── dataobject          ContentDO：数据库实体
│   ├── vo                  ContentAdminVO：管理端响应
│   └── enums               ContentKind：模块标识
├── converter/content       显式对象转换、公开 JSON 输出适配
├── common
│   ├── exception           业务异常
│   └── web                 错误响应、异常处理
├── config                  Spring Bean、安全配置
└── bootstrap               空数据库初始化
```

主调用链是 `Controller → Service → Mapper → 数据库`。Controller 做协议绑定和 DTO 校验，通过 Converter 生成 BO。Service 负责业务规则、事务、版本校验，并调用模块策略。Mapper 只负责持久化。DO 不离开服务边界，不直接序列化到 HTTP 响应。

`mapper` 是持久化访问层命名，当前由 Spring Data JPA 生成代理，**不是 MyBatis**；不配置 `@MapperScan`，也不混用两套 ORM。对象转换放在 `converter`，避免与持久化 Mapper 混淆。

文章、项目、站点设置现在共享相同的内容表和 CRUD 契约，因此公共 CRUD 集中在 content 模块，差异规则放在各业务模块的 `ContentPolicy`。项目和站点设置暂不增加限制，以兼容已有 JSON 内容；不要复制三套相同 Controller、Service、Mapper。将来有独立关系模型或工作流时，再在对应模块新增专用 DTO、DO、Service 和 Mapper。

## BO、DO、DTO、VO 怎么用

| 类型 | 职责 | 不应该做的事情 |
| --- | --- | --- |
| DTO | 接收跨层/接口输入；这里是 HTTP 写请求 | 携带 JPA 注解、接受客户端指定数据库 ID |
| BO | 表达业务命令、查询条件或业务读模型 | 依赖 Servlet、充当数据库实体 |
| DO | 映射 `entry` 表、数据库 ID 和乐观锁版本 | 直接作为 Controller 返回值 |
| VO | 展示响应，明确可返回给客户端的字段 | 保存数据库或承载业务流程 |

输入 `data` 是现有富文本和模块内容的 JSON 对象，仍保留其可扩展结构。请求经过显式字段映射，JSON 内的 `slug/title/updatedAt` 不能覆盖公开响应中的服务端字段。BO/DTO/VO 使用 Java record；DO 使用私有属性与访问方法。未增加反射式属性复制、全局静态 Bean 获取器或无业务含义的 BaseService。

公开接口继续返回原来的 JSON 结构，管理端 VO 保留 `body` 字符串字段，避免破坏现有管理页面的 `JSON.parse(row.body)`。没有强行套 `Result<T>`，否则前端所有列表和详情都需要同步迁移。可预期业务错误统一为 `{code,error}`；认证、鉴权和 CSRF 仍由 Spring Security 过滤器处理。

## Bean 与事务

- 单例服务无请求级可变状态，依赖通过构造器注入；不使用字段注入。
- `@Service` 管理服务，`@Component` 管理转换器与模块策略，`@Configuration/@Bean` 管理 Clock、PasswordEncoder 和安全过滤链。
- 策略注册器接收 Spring 注入的 `List<ContentPolicy>`；缺少或重复模块策略时启动失败，避免运行到某个请求才暴露配置错误。
- 服务类默认只读事务，新增/修改/删除方法单独开启写事务。`saveAndFlush` 后才生成 VO，确保返回最新版本号；删除也显式 flush。
- 更新和删除先比较客户端版本，再由 JPA `@Version` 防止检查后的并发覆盖；两种冲突都返回 HTTP 409。
- 时钟以 Bean 注入，便于测试中替换固定时间。管理员口令从 `BLOG_ADMIN_PASSWORD` 注入并 BCrypt 编码，生产环境没有默认口令。
- 初始化通过业务服务写入，遵守同样的规则，整个导入在一个事务内；仅空库导入，不覆盖已有内容。可通过 `BLOG_SEED_ENABLED=false` 关闭。

## 数据兼容与性能边界

本次没有改变 `entry` 表、UUID 类型、唯一约束、JSON 字段、时间字段或版本字段，无需迁移现有数据。PostgreSQL 默认使用 `ddl-auto=validate`，不要在已有库重新执行建表脚本。

公开列表在数据库中过滤模块和发布状态，以更新时间、ID 确定稳定顺序；通过只读投影和 fetch-size 128 流式读取，服务在事务内关闭游标。标题、JSON 分类仍在 Java 侧过滤，随后分页，以保持原有 PostgreSQL/H2 行为一致。它避免一次加载所有 JPA 实体，但深分页和低命中率过滤仍需扫描很多记录，不等同于数据库索引分页。数据量增长时应把可检索分类规范化为字段并配合 SQL 分页/全文搜索；该变更需单独设计数据迁移。旧管理列表为兼容现有页面仍返回全量，未来新增分页版本时同步升级页面。

目前仍是单管理员 HTTP Basic + CSRF。多用户 RBAC、审计日志、媒体管理、数据库迁移版本化和运营监控属于后续独立能力，不因完成代码分层就自动具备。生产使用 HTTPS，按数据库文档配置 PostgreSQL。

## 新增模块的步骤

1. 在 `ContentKind` 添加模块标识，同时检查数据库 `ck_entry_kind` 约束是否需要版本化迁移。
2. 在 `service/<模块>` 添加 `ContentPolicy` 实现并声明 `@Component`；模块专属规则放在这里。
3. 有专用输入/输出时，在 `bean/<模块>/{dto,bo,vo}` 添加类型及对应 Converter；有独立表再增加 DO 和 Mapper。
4. 专属用例放在该模块 Service，涉及多次写入的业务操作在服务入口定义事务。
5. 补 API 契约、权限、业务边界、冲突和回滚测试，不只测试 getter/setter。

## 本地验证

使用 JDK 17 或 21 和 Maven 运行 `mvn -Pdev clean verify` 或 `mvn -Pprod clean verify`。测试显式激活 `test` profile，使用内存 H2、测试专用口令并关闭初始化，不需要生产凭据。默认构建为 dev；release 分支的 GitHub Actions 强制使用 prod 并检查产物环境。完整配置切换步骤见 README。测试包括旧 API 契约、输入校验、草稿隔离、模块隔离、重命名、版本冲突、JPA 并发写保护和 Spring 装配边界。

H2 测试不能替代 PostgreSQL JSONB、约束和生产运行环境验证；本次不自动连接或修改你的实际数据库。

2026-11-25 验证记录：本机使用 IntelliJ 附带的 JDK 25.0.4，按 Java 17 release 编译；Maven 测试 11 项全部通过，可执行 JAR 打包成功。构建下载使用临时阿里云 Maven 镜像配置，未修改项目仓库或全局 Maven 配置。尚未在 JDK 17/21 与真实 PostgreSQL 上运行验证。
