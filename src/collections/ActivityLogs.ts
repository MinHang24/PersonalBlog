import type { CollectionConfig } from "payload"
import { cmsRead } from "@/access/cms"

export const ActivityLogs: CollectionConfig = {
  slug: "activity-logs",
  labels: { singular: "操作记录", plural: "操作记录" },
  admin: {
    useAsTitle: "title",
    group: "系统",
    defaultColumns: ["title", "action", "actor", "occurredAt"],
  },
  access: {
    read: cmsRead,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "action", type: "text", required: true, label: "操作" },
    { name: "entity", type: "text", required: true, label: "内容类型" },
    { name: "documentID", type: "text", required: true, label: "原始 ID" },
    { name: "title", type: "text", required: true, label: "内容快照" },
    { name: "slugSnapshot", type: "text", label: "原固定链接" },
    { name: "actor", type: "text", required: true, label: "操作者" },
    {
      name: "source",
      type: "select",
      options: ["system", "member"],
      required: true,
      label: "来源",
    },
    {
      name: "occurredAt",
      type: "date",
      required: true,
      index: true,
      label: "时间",
    },
  ],
}
