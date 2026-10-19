import type { CollectionConfig } from "payload"
import { cmsRead, cmsWrite, contentRead } from "@/access/cms"
import { contentChanged, contentDeleted, prepareContent } from "@/hooks/content"
import { contentEditor, publicationFields } from "./content-fields"

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "项目", plural: "项目" },
  access: {
    read: contentRead,
    create: cmsWrite,
    update: cmsWrite,
    delete: cmsWrite,
    readVersions: cmsRead,
  },
  admin: {
    useAsTitle: "title",
    group: "内容",
    defaultColumns: ["title", "_status", "visibility", "featured"],
    preview: (doc) => `/preview/projects/${doc.id}`,
  },
  versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 30 },
  hooks: {
    beforeChange: [prepareContent],
    afterChange: [contentChanged],
    afterDelete: [contentDeleted],
  },
  fields: [
    { name: "title", type: "text", required: true, label: "项目名称" },
    { name: "description", type: "textarea", label: "项目简介" },
    {
      name: "content",
      type: "richText",
      label: "项目正文",
      editor: contentEditor,
    },
    {
      name: "highlights",
      type: "array",
      label: "项目亮点",
      fields: [{ name: "text", type: "text", required: true, label: "说明" }],
    },
    ...publicationFields,
    {
      name: "isSample",
      type: "checkbox",
      defaultValue: false,
      label: "示例项目",
      admin: { position: "sidebar" },
    },
    {
      name: "relatedPost",
      type: "relationship",
      relationTo: "posts",
      label: "关联文章",
      maxDepth: 1,
    },
    ...["sourceUrl", "demoUrl", "downloadUrl"].map((name, index) => ({
      name,
      type: "text" as const,
      label: [
        "源代码 HTTPS 地址",
        "在线演示 HTTPS 地址",
        "公开下载 HTTPS 地址",
      ][index],
    })),
  ],
}
