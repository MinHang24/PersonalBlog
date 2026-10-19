import type { CollectionConfig } from "payload"
import { contentRead, cmsRead, cmsWrite, serverField } from "@/access/cms"
import { contentChanged, contentDeleted, prepareContent } from "@/hooks/content"
import { contentEditor, publicationFields } from "./content-fields"

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "文章", plural: "文章" },
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
    defaultColumns: [
      "title",
      "category",
      "_status",
      "visibility",
      "publishedAt",
    ],
    preview: (doc) => `/preview/posts/${doc.id}`,
  },
  versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 30 },
  hooks: {
    beforeChange: [prepareContent],
    afterChange: [contentChanged],
    afterDelete: [contentDeleted],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "标题",
    },
    { name: "excerpt", type: "textarea", label: "摘要" },
    {
      name: "content",
      type: "richText",
      label: "正文",
      editor: contentEditor,
    },
    ...publicationFields,
    {
      name: "category",
      type: "select",
      label: "分类",
      defaultValue: "go",
      options: [
        { label: "Go", value: "go" },
        { label: "Rust", value: "rust" },
        { label: "音视频", value: "multimedia" },
        { label: "桌面开发", value: "desktop" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "legacyHeadingAnchors",
      type: "json",
      admin: { hidden: true },
      access: { create: serverField, update: serverField },
    },
  ],
}
