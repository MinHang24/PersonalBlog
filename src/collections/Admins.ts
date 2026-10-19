import type { Access, CollectionConfig } from "payload"
import {
  adminField,
  canAdministerCms,
  cmsAdmin,
  currentCmsRole,
} from "@/access/cms"
import { APIError } from "payload"

const accountReadOrUpdate: Access = async ({ req }) => {
  if (req.user?.collection !== "admins") return false
  return (await canAdministerCms(req)) ? true : { id: { equals: req.user.id } }
}

export const Admins: CollectionConfig = {
  slug: "admins",
  labels: { singular: "管理成员", plural: "账户管理" },
  access: {
    create: () => false,
    delete: cmsAdmin,
    read: accountReadOrUpdate,
    update: accountReadOrUpdate,
  },
  admin: {
    useAsTitle: "email",
    group: "系统",
    description:
      "成员准入和撤销由 Make 管理。角色不是成员资格证明；独立密码登录尚待正式环境验证。",
  },
  auth: true,
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        if (
          originalDoc?.role === "administrator" &&
          Object.hasOwn(data, "role") &&
          data.role !== "administrator"
        ) {
          const { totalDocs } = await req.payload.count({
            collection: "admins",
            overrideAccess: true,
            req,
            where: { role: { equals: "administrator" } },
          })
          if (totalDocs <= 1)
            throw new APIError("不能降低最后一名管理员的权限。", 409)
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const account = await req.payload.findByID({
          collection: "admins",
          id,
          overrideAccess: true,
          req,
        })
        if (account.role === "administrator") {
          const { totalDocs } = await req.payload.count({
            collection: "admins",
            overrideAccess: true,
            req,
            where: { role: { equals: "administrator" } },
          })
          if (totalDocs <= 1)
            throw new APIError("不能删除最后一名管理员。", 409)
        }
        if ((await currentCmsRole(req)) !== "administrator")
          throw new APIError("无权删除管理成员。", 403)
      },
    ],
  },
  fields: [
    { name: "displayName", type: "text", label: "显示名称" },
    {
      name: "role",
      type: "select",
      label: "角色",
      options: [
        { label: "管理员", value: "administrator" },
        { label: "编辑", value: "editor" },
        { label: "只读", value: "viewer" },
      ],
      access: { create: adminField, update: adminField },
      admin: {
        description: "无默认管理员。现有账号的首次角色回填须经单独确认。",
      },
    },
  ],
}
