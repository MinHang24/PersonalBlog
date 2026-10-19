import type { Field } from "payload"
import { createTagField } from "payload"
import {
  BlocksFeature,
  CodeBlock,
  lexicalEditor,
  LinkFeature,
  TableFeature,
  UploadFeature,
} from "@payloadcms/richtext-lexical"
import { serverField } from "@/access/cms"

export const contentEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter(
      (feature) => !["relationship", "link", "upload"].includes(feature.key),
    ),
    LinkFeature({ enabledCollections: ["posts", "projects"] }),
    UploadFeature({ enabledCollections: ["media"] }),
    TableFeature(),
    BlocksFeature({ blocks: [CodeBlock()] }),
  ],
})

export const publicationFields: Field[] = [
  {
    name: "slug",
    type: "slug",
    useAsSlug: "title",
    required: false,
    label: "固定链接",
  },
  createTagField({ relationTo: "tags" }),
  {
    name: "cover",
    type: "upload",
    relationTo: "media",
    label: "封面",
    admin: { position: "sidebar" },
  },
  {
    name: "publishedAt",
    type: "date",
    label: "发布日期",
    admin: { position: "sidebar", date: { pickerAppearance: "dayOnly" } },
  },
  {
    name: "featured",
    type: "checkbox",
    label: "首页推荐",
    defaultValue: false,
    admin: { position: "sidebar" },
  },
  {
    name: "visibility",
    type: "select",
    label: "可见性",
    defaultValue: "public",
    options: [
      { value: "public", label: "公开" },
      { value: "hidden", label: "隐藏" },
    ],
    admin: {
      position: "sidebar",
      description:
        "草稿不影响线上版本；隐藏设置在发布后生效。立即撤回请取消发布。",
    },
  },
  {
    name: "mediaRefs",
    type: "relationship",
    relationTo: "media",
    hasMany: true,
    admin: { hidden: true },
    access: { create: serverField, update: serverField, read: () => false },
  },
]
