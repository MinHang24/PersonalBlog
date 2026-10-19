export type Granularity = "week" | "month" | "year"
export interface CmsFilters {
  granularity: Granularity
  from: string
  to: string
  page: number
  action: string
  allTime: boolean
}
const actions = [
  "",
  "create",
  "update",
  "publish",
  "unpublish",
  "hide",
  "delete",
  "settings",
]

export function shanghaiDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00+08:00`)
  return Number.isFinite(date.getTime()) && shanghaiDate(date) === value
}
export function parseCmsFilters(params: URLSearchParams): CmsFilters {
  const granularity = params.get("granularity") || "month"
  if (!["week", "month", "year"].includes(granularity))
    throw new Error("请选择周、月或年。")
  const from = params.get("from") || ""
  const to = params.get("to") || ""
  if (
    Boolean(from) !== Boolean(to) ||
    (from && (!validDate(from) || !validDate(to) || from > to))
  ) {
    throw new Error("请填写有效的起止日期，开始日期不能晚于结束日期。")
  }
  const rawPage = params.get("page") || "1"
  const page = /^[1-9]\d{0,5}$/.test(rawPage) ? Number(rawPage) : 1
  const action = params.get("action") || ""
  if (!actions.includes(action)) throw new Error("无效的操作类型。")
  return {
    granularity: granularity as Granularity,
    from,
    to,
    page,
    action,
    allTime: !from,
  }
}
export function inDateRange(
  date: string,
  filters: Pick<CmsFilters, "from" | "to">,
) {
  const value = shanghaiDate(new Date(date))
  return (
    (!filters.from || value >= filters.from) &&
    (!filters.to || value <= filters.to)
  )
}
export function dateBounds(from: string, to: string) {
  return {
    greater_than_equal: new Date(`${from}T00:00:00+08:00`).toISOString(),
    less_than: new Date(
      new Date(`${to}T00:00:00+08:00`).getTime() + 86400000,
    ).toISOString(),
  }
}
export function displayState(doc: {
  visibility?: string | null
  _status?: string | null
}) {
  return doc.visibility === "hidden"
    ? "hidden"
    : doc._status === "published"
      ? "published"
      : "draft"
}
export function comparison(
  current: number,
  previous: number,
  allTime: boolean,
) {
  if (allTime) return "累计"
  if (!previous) return current ? "新增" : "无变化"
  const percent = ((current - previous) / previous) * 100
  return percent === 0
    ? "无变化"
    : `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`
}
export function trendKey(value: string, granularity: Granularity) {
  const date = shanghaiDate(new Date(value))
  if (granularity === "year") return date.slice(0, 4)
  if (granularity === "month") return date.slice(0, 7)
  const monday = new Date(`${date}T00:00:00+08:00`)
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay() || 7
  monday.setTime(monday.getTime() - (weekday - 1) * 86400000)
  return shanghaiDate(monday)
}
