import "server-only"
import type { Where } from "payload"
import type { requireCmsPrincipal } from "@/lib/cms-auth"
import { categories } from "@/lib/articles"
import {
  comparison,
  dateBounds,
  displayState,
  inDateRange,
  shanghaiDate,
  trendKey,
  type CmsFilters,
} from "./filters"

export async function dashboardData(
  principal: Awaited<ReturnType<typeof requireCmsPrincipal>>,
  filters: CmsFilters,
) {
  const { payload, user } = principal
  const [{ docs: all }, { docs: published }] = await Promise.all([
    payload.find({
      collection: "posts",
      depth: 0,
      pagination: false,
      draft: true,
      overrideAccess: false,
      user,
      select: {
        title: true,
        category: true,
        publishedAt: true,
        createdAt: true,
        visibility: true,
        _status: true,
      },
    }),
    payload.find({
      collection: "posts",
      depth: 0,
      pagination: false,
      draft: false,
      overrideAccess: false,
      user,
      where: {
        and: [
          { _status: { equals: "published" } },
          { visibility: { equals: "public" } },
        ],
      },
      select: { publishedAt: true, category: true },
    }),
  ])
  const selected = all.filter((post) =>
    inDateRange(post.publishedAt || post.createdAt, filters),
  )
  const counts = (rows: typeof all) => ({
    total: rows.length,
    published: rows.filter((row) => displayState(row) === "published").length,
    draft: rows.filter((row) => displayState(row) === "draft").length,
    hidden: rows.filter((row) => displayState(row) === "hidden").length,
  })
  const current = counts(selected)
  let previous = counts([])
  if (!filters.allTime) {
    const duration =
      new Date(filters.to).getTime() -
      new Date(filters.from).getTime() +
      86400000
    const prior = {
      from: shanghaiDate(
        new Date(
          new Date(`${filters.from}T00:00:00+08:00`).getTime() - duration,
        ),
      ),
      to: shanghaiDate(
        new Date(
          new Date(`${filters.from}T00:00:00+08:00`).getTime() - 86400000,
        ),
      ),
    }
    previous = counts(
      all.filter((post) =>
        inDateRange(post.publishedAt || post.createdAt, prior),
      ),
    )
  }
  const distribution = categories.map((category) => {
    const count = selected.filter((row) => row.category === category.id).length
    return {
      ...category,
      count,
      percent: selected.length
        ? Math.round((count / selected.length) * 100)
        : 0,
    }
  })
  const trend = new Map<string, number>()
  for (const post of published) {
    if (post.publishedAt && inDateRange(post.publishedAt, filters)) {
      const key = trendKey(post.publishedAt, filters.granularity)
      trend.set(key, (trend.get(key) ?? 0) + 1)
    }
  }
  const logWhere: Where = {
    and: [
      ...(filters.from
        ? [{ occurredAt: dateBounds(filters.from, filters.to) }]
        : []),
      ...(filters.action ? [{ action: { equals: filters.action } }] : []),
    ],
  }
  const logCount = await payload.count({
    collection: "activity-logs",
    overrideAccess: false,
    user,
    where: logWhere,
  })
  const pages = Math.max(1, Math.ceil(logCount.totalDocs / 10))
  const page = Math.min(filters.page, pages)
  const logs = await payload.find({
    collection: "activity-logs",
    depth: 0,
    overrideAccess: false,
    user,
    where: logWhere,
    sort: "-occurredAt",
    page,
    limit: 10,
    select: {
      title: true,
      action: true,
      actor: true,
      occurredAt: true,
      entity: true,
      source: true,
    },
  })
  return {
    filters: { ...filters, page },
    role: principal.role,
    metrics: (["total", "published", "draft", "hidden"] as const).map(
      (key) => ({
        key,
        value: current[key],
        comparison: comparison(current[key], previous[key], filters.allTime),
      }),
    ),
    trend: [...trend]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, count]) => ({ label, count })),
    distribution,
    activity: { docs: logs.docs, total: logs.totalDocs, page, pages },
  }
}

export type DashboardData = Awaited<ReturnType<typeof dashboardData>>
