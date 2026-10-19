import { requireCmsPrincipal, cmsErrorResponse } from "@/lib/cms-auth"
import { parseCmsFilters } from "@/lib/cms/filters"
import { dashboardData } from "@/lib/cms/dashboard"

export async function GET(request: Request) {
  try {
    const principal = await requireCmsPrincipal(request.headers)
    let filters
    try {
      filters = parseCmsFilters(new URL(request.url).searchParams)
    } catch (error) {
      return Response.json(
        {
          success: false,
          error: { code: "INVALID_FILTER", message: (error as Error).message },
        },
        { status: 400, headers: { "Cache-Control": "private, no-store" } },
      )
    }
    return Response.json(
      { success: true, data: await dashboardData(principal, filters) },
      { headers: { "Cache-Control": "private, no-store" } },
    )
  } catch (error) {
    return cmsErrorResponse(error)
  }
}
