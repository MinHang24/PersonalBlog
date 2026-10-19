import type { Access, FieldAccess, PayloadRequest, Where } from "payload"
import type { Admin } from "@/payload-types"

export type CmsRole = "administrator" | "editor" | "viewer"

// Do not replace this gate with an Admins-record check or a static member list.
// A platform-supported, revocation-aware membership verifier is still required.
export const cmsMembershipVerificationAvailable = false

export const publishedContent: Where = {
  and: [
    { _status: { equals: "published" } },
    { visibility: { equals: "public" } },
  ],
}

type RoleUser = Admin & {
  collection: "admins"
  role?: CmsRole | null
}

export async function currentCmsRole(
  req: PayloadRequest,
): Promise<CmsRole | null> {
  if (!req.user || req.user.collection !== "admins") return null
  const key = `cms-role:${req.user.id}`
  if (req.context[key]) return req.context[key] as CmsRole
  const account = (await req.payload.findByID({
    collection: "admins",
    id: req.user.id,
    depth: 0,
    overrideAccess: true,
    req,
  })) as RoleUser
  const role = account.role
  if (role !== "administrator" && role !== "editor" && role !== "viewer")
    return null
  req.context[key] = role
  return role
}

export async function canReadCms(req: PayloadRequest) {
  return (
    cmsMembershipVerificationAvailable && Boolean(await currentCmsRole(req))
  )
}

export async function canEditCms(req: PayloadRequest) {
  if (!cmsMembershipVerificationAvailable) return false
  const role = await currentCmsRole(req)
  return role === "administrator" || role === "editor"
}

export async function canAdministerCms(req: PayloadRequest) {
  return (
    cmsMembershipVerificationAvailable &&
    (await currentCmsRole(req)) === "administrator"
  )
}

export const cmsRead: Access = ({ req }) => canReadCms(req)
export const cmsWrite: Access = ({ req }) => canEditCms(req)
export const cmsAdmin: Access = ({ req }) => canAdministerCms(req)
export const contentRead: Access = async ({ req }) => {
  if (await canReadCms(req)) return true
  if (req.query?.draft === "true" || req.query?.draft === true) return false
  return publishedContent
}
export const adminField: FieldAccess = ({ req }) => canAdministerCms(req)
export const serverField: FieldAccess = () => false
