-- 连接 postgres 维护数据库，以具备 CREATEDB 权限的账号执行。
-- CREATE DATABASE 不能放进事务；数据库已存在时跳过本文件。
-- 数据库 owner 为执行本语句的账号，不在脚本中创建账号或写密码。
CREATE DATABASE personal_blog WITH ENCODING = 'UTF8' TEMPLATE = template0;
COMMENT ON DATABASE personal_blog IS '个人博客：React/Next.js + Spring Boot';
