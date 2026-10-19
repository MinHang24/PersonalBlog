import type { GlobalConfig } from "payload"
import { cmsAdmin } from "@/access/cms"
import { settingsChanged } from "@/hooks/content"
import { contentEditor } from "@/collections/content-fields"

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "网站设置",
  admin: { group: "系统" },
  access: { read: () => true, update: cmsAdmin },
  hooks: { afterChange: [settingsChanged] },
  fields: [
    {
      name: "siteTitle",
      type: "text",
      label: "网站名称",
      defaultValue: "敏航的手记",
    },
    {
      name: "siteSubtitle",
      type: "text",
      label: "网站副标题",
      defaultValue: "MINHANG / NOTES",
    },
    { name: "authorName", type: "text", label: "作者", defaultValue: "敏航" },
    { name: "initials", type: "text", label: "头像缩写", defaultValue: "敏" },
    { name: "tagline", type: "text", label: "标语" },
    { name: "bio", type: "textarea", label: "个人简介" },
    {
      name: "about",
      type: "richText",
      label: "关于页正文",
      editor: contentEditor,
    },
    { name: "avatar", type: "upload", relationTo: "media", label: "头像" },
    { name: "email", type: "email", label: "公开联系邮箱" },
    { name: "githubUrl", type: "text", label: "GitHub HTTPS 地址" },
    {
      name: "socialLinks",
      type: "array",
      label: "社交链接",
      fields: [
        { name: "label", type: "text", required: true, label: "名称" },
        { name: "url", type: "text", required: true, label: "HTTPS 地址" },
      ],
    },
    {
      name: "expertise",
      type: "array",
      label: "关注领域",
      fields: [
        {
          name: "key",
          type: "select",
          options: ["go", "rust", "multimedia", "desktop"],
          required: true,
          label: "分类",
        },
        { name: "title", type: "text", required: true, label: "名称" },
        { name: "description", type: "text", label: "短描述" },
        { name: "detail", type: "textarea", label: "详细说明" },
      ],
    },
    {
      name: "techStack",
      type: "array",
      label: "技术栈",
      fields: [
        { name: "name", type: "text", required: true, label: "名称" },
        {
          name: "kind",
          type: "select",
          options: ["go", "rust", "multimedia", "desktop"],
          required: true,
          label: "领域",
        },
        { name: "note", type: "text", label: "说明" },
      ],
    },
  ],
}
