import type { CollectionConfig } from "payload"
import { cmsAdmin, cmsRead } from "@/access/cms"
import { resourceChanged, resourceDeleted } from "@/hooks/content"
import { createHash } from "node:crypto"
import { serverField } from "@/access/cms"

export const ProtectedDownloads: CollectionConfig = {
  slug: "protected-downloads",
  labels: { singular: "授权下载", plural: "授权下载" },
  admin: {
    useAsTitle: "name",
    group: "资源",
    enableRichTextRelationship: false,
  },
  access: {
    read: cmsRead,
    create: cmsAdmin,
    update: cmsAdmin,
    delete: cmsAdmin,
  },
  upload: {
    mimeTypes: ["application/zip", "application/x-zip-compressed"],
    modifyResponseHeaders: ({ headers }) => {
      headers.set("Cache-Control", "private, no-store")
      headers.set("Content-Disposition", "attachment")
      headers.set("X-Content-Type-Options", "nosniff")
      return headers
    },
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (req.file?.data)
          data.sha256 = createHash("sha256").update(req.file.data).digest("hex")
        return data
      },
    ],
    afterChange: [resourceChanged],
    afterDelete: [resourceDeleted],
  },
  fields: [
    { name: "name", type: "text", required: true, label: "资料名称" },
    { name: "description", type: "textarea", label: "版本说明" },
    {
      name: "sha256",
      type: "text",
      label: "SHA-256",
      admin: { readOnly: true },
      access: { create: serverField, update: serverField },
    },
  ],
}
