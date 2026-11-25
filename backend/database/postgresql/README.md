# PostgreSQL 数据库部署

代码位置：`/Users/Admin/IdeaProjects/PersonalBlog/backend`。
SQL 副本位于项目的 `database/postgresql/`，同时提供本文件夹下载版。

## 执行顺序

1. 用数据库管理账号连接 `postgres` 数据库，执行 `01-create-database.sql`。建库语句必须在自动提交模式下执行，不能包在事务里。已经创建 personal_blog 时跳过此步。
2. 切换连接到 `personal_blog`，执行 `02-schema.sql`。这是全新数据库建表脚本，已有同名表会报错，不会覆盖数据。
3. 可选执行 `03-seed-optional.sql`：导入9篇文章、3个项目、1条站点设置。使用冲突跳过策略，不覆盖已存在的同类 slug。也可让后端在空表首次启动时自动导入。两种方式任选其一。

psql 示例（替换 `your_db_user`，密码通过客户端提示输入）：

```sh
psql -h localhost -U your_db_user -d postgres -v ON_ERROR_STOP=1 -f 01-create-database.sql
psql -h localhost -U your_db_user -d personal_blog -v ON_ERROR_STOP=1 -f 02-schema.sql
psql -h localhost -U your_db_user -d personal_blog -v ON_ERROR_STOP=1 -f 03-seed-optional.sql
```

图形客户端同样可以执行；第1步与后两步必须使用不同的数据库连接。

## 应用连接

后端默认启用 postgres 配置，启动前设置：

- `DATABASE_URL=jdbc:postgresql://localhost:5432/personal_blog`
- `DATABASE_USER`：数据库账号
- `DATABASE_PASSWORD`：数据库密码
- `BLOG_ADMIN_PASSWORD`：博客后台管理员密码，至少16字符，和数据库密码不是一回事

在 IDEA Run Configuration 的 Environment variables 中填写即可，不要提交密码到仓库。在 backend 目录运行 `mvn spring-boot:run`，或使用构建后的 `java -jar target/backend-1.0.0.jar`。数据库账号需具备 public schema 的 USAGE 和 entry 表的 SELECT/INSERT/UPDATE/DELETE 权限；若与建表账号相同，已作为表所有者具备权限。

应用使用 `ddl-auto=validate`，启动只验证结构，不自动建表或改表。Hibernate JSON 映射已同步修改，避免 PostgreSQL 的 TEXT/大对象 OID 与 JSONB 类型混用。开发时如需旧 H2 模式，可显式使用 `SPRING_PROFILES_ACTIVE=h2`；旧 H2 文件的 TEXT 列不会由这份 PostgreSQL 脚本自动迁移。

## 表设计

当前业务使用一张实体表 `public.entry`，与后端 Entry 实体一致，未创建尚未接入代码的用户、评论或媒体空表。

| 字段 | 类型 | 作用 |
|---|---|---|
| id | varchar(36) | 应用生成的 UUID，主键 |
| version | bigint | 乐观锁，默认0 |
| kind | varchar(16) | posts / projects / settings |
| slug | varchar(150) | 同类型唯一链接；站点信息为 site |
| title | varchar(300) | 必填标题 |
| published | boolean | 草稿/发布，默认false |
| updated_at | timestamptz(6) | 修改时间点，由应用更新 |
| body | jsonb | 正文与类型专属字段 |

`body` 中，文章保存 category、excerpt、tags、content、headings 等；项目保存 description、tags、highlights、sourceUrl 等；站点设置保存作者、介绍和社交链接等。title/slug/updatedAt 以独立列为准，公开接口会覆盖 JSON 中同名值。正文 JSON 在数据库中必须是对象，文章分类必须是四个现有分类之一。

约束包括主键、(kind,slug)唯一、类型枚举、slug格式、非空标题、非负版本及 JSON 对象检查。索引包括(kind,updated_at DESC)和仅已发布内容的同列部分索引。当前 API 搜索/分页仍在 Java 中完成，后续数据量增长需改为数据库分页；这些索引不代表已完成该优化。

管理员仍来自环境变量，未改为数据库用户系统。该 SQL 面向新建 PostgreSQL 数据库，不负责迁移已编辑过的 H2 数据；种子仅包含最初静态内容。

参考：PostgreSQL JSONB https://www.postgresql.org/docs/current/datatype-json.html ，Hibernate JSON映射 https://docs.hibernate.org/orm/6.6/userguide/html_single/#basic-mapping-json 。

## 验证情况

已通过 Maven 打包及2项 H2 集成测试，JSON映射可读写，13条种子数据的唯一性与分类校验通过。当前机器没有 PostgreSQL 实例，尚未在真实 PostgreSQL 执行 SQL 或验证 ddl-auto=validate 启动。
