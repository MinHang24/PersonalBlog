import { cmsErrorResponse, requireCmsPrincipal } from "@/lib/cms-auth"
import { inDateRange, parseCmsFilters } from "@/lib/cms/filters"
import { csvDocument } from "@/lib/cms/csv"

export async function GET(request: Request) {
  try {
    const { payload, user } = await requireCmsPrincipal(request.headers)
    const params = new URL(request.url).searchParams
    const type = params.get("type") || "posts"
    let filters
    try {
      filters = parseCmsFilters(params)
    } catch {
      return Response.json(
        { success: false, error: { message: "导出日期范围无效。" } },
        { status: 400, headers: { "Cache-Control": "private, no-store" } },
      )
    }
    if (!["posts", "projects", "activity"].includes(type)) {
      return Response.json(
        { success: false, error: { message: "不支持的导出类型。" } },
        { status: 400, headers: { "Cache-Control": "private, no-store" } },
      )
    }
    let csv: string
    if (type === "activity") {
      const { docs } = await payload.find({
        collection: "activity-logs",
        depth: 0,
        pagination: false,
        overrideAccess: false,
        user,
        sort: "-occurredAt",
      })
      csv = csvDocument(
        ["内容", "类型", "动作", "操作者", "时间"],
        docs
          .filter(
            (doc) =>
              inDateRange(doc.occurredAt, filters) &&
              (!filters.action || doc.action === filters.action),
          )
          .map((doc) => [
            doc.title,
            doc.entity,
            doc.action,
            doc.actor,
            doc.occurredAt,
          ]),
      )
    } else if (type === "posts") {
      const { docs } = await payload.find({
        collection: "posts",
        depth: 0,
        draft: true,
        pagination: false,
        overrideAccess: false,
        user,
      })
      csv = csvDocument(
        ["标题", "固定链接", "摘要", "分类", "发布状态", "可见性", "发布日期"],
        docs
          .filter((doc) =>
            inDateRange(doc.publishedAt || doc.createdAt, filters),
          )
          .map((doc) => [
            doc.title,
            doc.slug,
            doc.excerpt,
            doc.category,
            doc._status,
            doc.visibility,
            doc.publishedAt,
          ]),
      )
    } else {
      const { docs } = await payload.find({
        collection: "projects",
        depth: 0,
        draft: true,
        pagination: false,
        overrideAccess: false,
        user,
      })
      csv = csvDocument(
        ["项目", "固定链接", "简介", "发布状态", "可见性", "示例项目"],
        docs
          .filter((doc) =>
            inDateRange(doc.publishedAt || doc.createdAt, filters),
          )
          .map((doc) => [
            doc.title,
            doc.slug,
            doc.description,
            doc._status,
            doc.visibility,
            doc.isSample,
          ]),
      )
    }
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="minhang-${type}.csv"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    return cmsErrorResponse(error)
  }
}
