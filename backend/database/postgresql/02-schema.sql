-- 先连接 personal_blog，再执行本文件。用于全新数据库。
-- 不使用 IF NOT EXISTS：已有同名表时明确报错，避免掩盖旧结构差异。
BEGIN;
CREATE TABLE public.entry (
    id varchar(36) PRIMARY KEY,
    version bigint NOT NULL DEFAULT 0,
    kind varchar(16) NOT NULL,
    slug varchar(150) NOT NULL,
    title varchar(300) NOT NULL,
    published boolean NOT NULL DEFAULT false,
    updated_at timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    body jsonb NOT NULL,
    CONSTRAINT uq_entry_kind_slug UNIQUE (kind, slug),
    CONSTRAINT ck_entry_version CHECK (version >= 0),
    CONSTRAINT ck_entry_kind CHECK (kind IN ('posts', 'projects', 'settings')),
    CONSTRAINT ck_entry_slug CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT ck_entry_title CHECK (length(btrim(title)) > 0),
    CONSTRAINT ck_entry_body CHECK (jsonb_typeof(body) = 'object'),
    CONSTRAINT ck_entry_post_category CHECK (
        kind <> 'posts' OR (body ? 'category' AND jsonb_typeof(body->'category') = 'string'
        AND body->>'category' IN ('go', 'rust', 'multimedia', 'desktop'))
    )
);
CREATE INDEX idx_entry_kind_updated ON public.entry (kind, updated_at DESC);
CREATE INDEX idx_entry_public_updated ON public.entry (kind, updated_at DESC) WHERE published;
COMMENT ON TABLE public.entry IS '统一内容表：文章、项目与站点设置；与当前 Spring Entry 实体对应';
COMMENT ON COLUMN public.entry.id IS '应用生成 UUID 字符串，保持现有 Java String ID 契约';
COMMENT ON COLUMN public.entry.version IS 'JPA 乐观锁版本；修改请求必须提交当前版本';
COMMENT ON COLUMN public.entry.kind IS 'posts文章 / projects项目 / settings站点设置';
COMMENT ON COLUMN public.entry.slug IS '同一种内容内唯一的固定链接；站点配置使用 site';
COMMENT ON COLUMN public.entry.title IS '后台显示标题；公开接口以本列为准';
COMMENT ON COLUMN public.entry.published IS 'true公开，false草稿或下架';
COMMENT ON COLUMN public.entry.updated_at IS 'UTC时间点；应用在保存时更新';
COMMENT ON COLUMN public.entry.body IS 'JSONB 内容DTO：正文、标签、分类、封面、项目链接或站点信息；不是JSON字符串字面量';
COMMIT;
