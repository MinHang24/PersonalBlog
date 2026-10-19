import type { CollectionConfig } from "payload"
import { cmsRead, cmsWrite } from "@/access/cms"

export const Folders: CollectionConfig = {
  slug: "folders",
  labels: { singular: "文件夹", plural: "文件夹" },
  access: {
    read: cmsRead,
    create: cmsWrite,
    update: cmsWrite,
    delete: cmsWrite,
  },
  admin: {
    useAsTitle: "name",
    group: "资源",
  },
  folders: true,
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
  ],
}
