import type { CollectionConfig } from "payload"
import { createFolderField, createTagField } from "payload"
import { canReadCms, cmsWrite } from "@/access/cms"
import {
  protectReferencedResource,
  publiclyReferencedIDs,
  resourceChanged,
  resourceDeleted,
} from "@/hooks/content"

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "媒体", plural: "媒体库" },
  admin: { group: "资源" },
  access: {
    read: async ({ req }) =>
      (await canReadCms(req))
        ? true
        : { id: { in: await publiclyReferencedIDs(req, "mediaRefs") } },
    create: cmsWrite,
    update: cmsWrite,
    delete: cmsWrite,
  },
  hooks: {
    beforeDelete: [protectReferencedResource],
    afterChange: [resourceChanged],
    afterDelete: [resourceDeleted],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    createFolderField({ relationTo: "folders" }),
    createTagField({ relationTo: "tags" }),
  ],
  upload: {
    mimeTypes: ["image/*"],
    modifyResponseHeaders: ({ headers }) => {
      headers.set("Cache-Control", "private, no-store")
      headers.set("X-Content-Type-Options", "nosniff")
      return headers
    },
  },
}
