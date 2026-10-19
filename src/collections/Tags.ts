import type { CollectionConfig } from "payload"
import { canReadCms, cmsWrite, serverField } from "@/access/cms"
import { APIError } from "payload"
import {
  protectReferencedResource,
  publiclyReferencedIDs,
  resourceChanged,
  resourceDeleted,
} from "@/hooks/content"

export const Tags: CollectionConfig = {
  slug: "tags",
  labels: { singular: "标签", plural: "标签" },
  access: {
    read: async ({ req }) =>
      (await canReadCms(req))
        ? true
        : { id: { in: await publiclyReferencedIDs(req, "tags") } },
    create: cmsWrite,
    update: cmsWrite,
    delete: cmsWrite,
  },
  admin: {
    useAsTitle: "name",
    group: "内容",
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const name = String(data.name ?? originalDoc?.name ?? "").trim()
        const normalizedName = name.normalize("NFKC").toLocaleLowerCase()
        const duplicate = await req.payload.find({
          collection: "tags",
          depth: 0,
          overrideAccess: true,
          req,
          limit: 1,
          where: {
            and: [
              { normalizedName: { equals: normalizedName } },
              ...(originalDoc ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
        })
        if (duplicate.totalDocs)
          throw new APIError("该标签已存在，请复用现有标签。", 409)
        return { ...data, name, normalizedName }
      },
    ],
    beforeDelete: [protectReferencedResource],
    afterChange: [resourceChanged],
    afterDelete: [resourceDeleted],
  },
  tags: true,
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "normalizedName",
      type: "text",
      index: true,
      admin: { hidden: true },
      access: { create: serverField, update: serverField },
    },
  ],
}
