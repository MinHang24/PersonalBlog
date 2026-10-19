import "server-only"
import { getPayloadClient } from "./payload"
import { cmsMembershipVerificationAvailable, type CmsRole } from "@/access/cms"

export class CmsAuthError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
  }
}

export async function requireCmsPrincipal(headers: Headers) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers })
  if (!user || user.collection !== "admins") {
    throw new CmsAuthError(401, "SIGN_IN_REQUIRED", "请先通过原生后台登录。")
  }
  if (!cmsMembershipVerificationAvailable) {
    throw new CmsAuthError(
      503,
      "MEMBERSHIP_VERIFICATION_PENDING",
      "Make 尚未提供可验证的实时成员资格接口。特权数据、预览、导出和下载暂时关闭；未降级为仅 SSO。",
    )
  }
  const account = await payload.findByID({
    collection: "admins",
    id: user.id,
    depth: 0,
    overrideAccess: true,
  })
  const role = account.role as CmsRole | null
  if (!role || !["administrator", "editor", "viewer"].includes(role)) {
    throw new CmsAuthError(
      403,
      "ROLE_REQUIRED",
      "此账户尚未分配后台角色，请由管理员处理。",
    )
  }
  return { payload, user, role, displayName: account.displayName || "后台成员" }
}

export function cmsErrorResponse(error: unknown) {
  if (error instanceof CmsAuthError)
    return Response.json(
      {
        success: false,
        error: { code: error.code, message: error.message },
      },
      {
        status: error.status,
        headers: { "Cache-Control": "private, no-store" },
      },
    )
  console.error(
    "CMS request failed",
    error instanceof Error ? error.name : "UnknownError",
  )
  return Response.json(
    {
      success: false,
      error: {
        code: "CMS_UNAVAILABLE",
        message: "后台数据暂时不可用，请稍后重试。未提交任何更改。",
      },
    },
    { status: 500, headers: { "Cache-Control": "private, no-store" } },
  )
}
