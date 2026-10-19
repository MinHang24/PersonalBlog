"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge, Button, InputField, SelectField } from "@figma/astraui"
import {
  ArrowRight,
  Archive,
  CheckCircle,
  Download,
  FileText,
  Pencil,
  RefreshCw,
  ShieldAlert,
} from "lucide-react"
import { AppLink, GlassSurface, Typography } from "@/components/ui"
import type { DashboardData } from "@/lib/cms/dashboard"

const metricLabels = ["文章总数", "公开发布", "草稿", "隐藏内容"]
const metricIcons = [FileText, CheckCircle, Pencil, Archive]
const actionLabels: Record<string, string> = {
  create: "新建",
  update: "修改",
  publish: "发布",
  unpublish: "取消发布",
  hide: "隐藏",
  delete: "删除",
  settings: "网站设置",
}

export function Dashboard() {
  const router = useRouter()
  const params = useSearchParams()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(true)
  const [reload, setReload] = useState(0)
  const [from, setFrom] = useState(params.get("from") || "")
  const [to, setTo] = useState(params.get("to") || "")
  const [exportType, setExportType] = useState("posts")
  const [exportError, setExportError] = useState("")
  const query = params.toString()
  useEffect(() => {
    const controller = new AbortController()
    setBusy(true)
    setError("")
    fetch(`/api/cms/dashboard?${query}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok || !result.success)
          throw new Error(result.error?.message || "无法读取后台数据。")
        setData(result.data)
      })
      .catch((failure) => {
        if (failure.name !== "AbortError") {
          setData(null)
          setError(failure.message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false)
      })
    return () => controller.abort()
  }, [query, reload])
  const update = (values: Record<string, string>) => {
    const next = new URLSearchParams(query)
    for (const [key, value] of Object.entries(values))
      value ? next.set(key, value) : next.delete(key)
    router.replace(`/admin${next.size ? `?${next}` : ""}`)
  }
  const exportCSV = async () => {
    setExportError("")
    try {
      const next = new URLSearchParams(query)
      next.set("type", exportType)
      const response = await fetch(`/api/cms/export?${next}`, {
        cache: "no-store",
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error?.message || "导出失败。")
      }
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement("a")
      link.href = url
      link.download = `minhang-${exportType}.csv`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (failure) {
      setExportError((failure as Error).message)
    }
  }
  const max = Math.max(1, ...(data?.trend.map((point) => point.count) || []))
  return (
    <div className="cms-dashboard flex flex-col gap-2xl" aria-busy={busy}>
      <div className="flex flex-wrap items-end justify-between gap-xl">
        <div>
          <Typography variant="eyebrow" className="text-brand-primary">
            MINHANG / CONTENT STUDIO
          </Typography>
          <div className="my-sm flex items-center gap-lg">
            <Typography as="h1" variant="section">
              创作，从这里继续。
            </Typography>
            <Badge label="内容概览" variant="secondary" />
          </div>
          <Typography variant="small" className="text-text-secondary">
            让想法被记录，让每一次分享都有迹可循。
          </Typography>
        </div>
        <AppLink to="/" target="_blank" className="text-link">
          查看网站
          <ArrowRight className="icon-sm" />
        </AppLink>
      </div>
      <GlassSurface className="!p-xl">
        <div className="flex flex-wrap items-end justify-between gap-xl">
          <div
            role="group"
            aria-label="趋势聚合粒度"
            className="flex gap-xs rounded-corner-full bg-bg-faint p-xs"
          >
            {[
              ["week", "按周"],
              ["month", "按月"],
              ["year", "按年"],
            ].map(([value, label]) => (
              <Button
                key={value}
                size="small"
                variant={
                  (params.get("granularity") || "month") === value
                    ? "neutral"
                    : "subtle"
                }
                aria-pressed={(params.get("granularity") || "month") === value}
                onClick={() => update({ granularity: value, page: "" })}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-lg">
            <InputField
              label="开始日期"
              type="date"
              aria-label="开始日期"
              value={from}
              onChange={setFrom}
            />
            <InputField
              label="结束日期"
              type="date"
              aria-label="结束日期"
              value={to}
              onChange={setTo}
            />
            <Button
              size="small"
              variant="neutral"
              onClick={() => update({ from, to, page: "" })}
            >
              应用
            </Button>
            <Button
              size="small"
              variant="subtle"
              onClick={() => {
                setFrom("")
                setTo("")
                update({ from: "", to: "", page: "" })
              }}
            >
              全部时间
            </Button>
          </div>
        </div>
      </GlassSurface>
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-start gap-lg rounded-corner-lg bg-bg-subtle p-2xl"
        >
          <ShieldAlert className="icon text-warning" />
          <div className="min-w-0 flex-1">
            <Typography variant="small" className="font-semibold">
              安全验证待完成
            </Typography>
            <Typography variant="small">{error}</Typography>
          </div>
          <Button
            variant="neutral"
            size="small"
            onClick={() => setReload((value) => value + 1)}
            iconStart={<RefreshCw className="icon-sm" />}
          >
            重新检查
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 xl:grid-cols-4">
        {metricLabels.map((label, index) => {
          const Icon = metricIcons[index]
          return (
            <GlassSurface key={label} className="!p-2xl">
              <div className="flex items-center justify-between gap-xl">
                <Typography variant="small" className="text-text-secondary">
                  {label}
                </Typography>
                <span className="rounded-corner-md bg-bg-faint p-md text-brand-primary">
                  <Icon className="icon-sm" />
                </span>
              </div>
              <Typography variant="page" className="my-lg">
                {data
                  ? data.metrics[index].value.toString().padStart(2, "0")
                  : "—"}
              </Typography>
              <div className="flex items-center justify-between">
                <Typography variant="meta" className="text-text-secondary">
                  {data?.filters.allTime === false
                    ? "对比上一等长区间"
                    : "全部时间"}
                </Typography>
                <Badge
                  label={
                    data?.metrics[index].comparison ||
                    (busy ? "读取中" : "未授权读取")
                  }
                  variant="secondary"
                />
              </div>
            </GlassSurface>
          )
        })}
      </div>
      <GlassSurface className="!p-2xl">
        <div className="mb-2xl flex flex-wrap items-center justify-between gap-lg">
          <div>
            <Typography as="h2" variant="card">
              文字的足迹
            </Typography>
            <Typography variant="meta" className="text-text-secondary">
              当前公开文章按发布日期分布 · Asia/Shanghai
            </Typography>
          </div>
          <Badge label="发布趋势" variant="brand" />
        </div>
        {data?.trend.length ? (
          <div
            className="flex min-h-(--cms-chart-height) items-end gap-xl overflow-x-auto"
            role="img"
            aria-label={data.trend
              .map((point) => `${point.label}：${point.count} 篇`)
              .join("；")}
          >
            {data.trend.map((point) => (
              <div
                key={point.label}
                className="flex h-(--cms-chart-height) min-w-(--cms-chart-column) flex-1 flex-col items-center justify-end gap-md"
              >
                <Typography variant="meta">{point.count}</Typography>
                <div
                  className="w-full max-w-(--cms-chart-column) rounded-t-corner-md bg-brand-secondary"
                  style={
                    { height: `${(point.count / max) * 72}%` } as CSSProperties
                  }
                />
                <Typography
                  variant="meta"
                  className="whitespace-nowrap text-text-secondary"
                >
                  {point.label}
                </Typography>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-(--cms-chart-height) items-center justify-center rounded-corner-lg bg-bg-faint">
            <Typography variant="small" className="text-text-secondary">
              {busy
                ? "正在读取发布趋势…"
                : error
                  ? "完成权限验证后，显示真实发布趋势。"
                  : "这个区间还没有公开发布的文章。"}
            </Typography>
          </div>
        )}
      </GlassSurface>
      <div className="grid grid-cols-1 gap-xl xl:grid-cols-3">
        <GlassSurface className="min-w-0 !p-2xl xl:col-span-2">
          <div className="mb-xl flex flex-wrap items-center justify-between gap-lg">
            <Typography as="h2" variant="card">
              最近操作
            </Typography>
            <SelectField
              aria-label="筛选操作"
              options={[
                { value: "", label: "全部操作" },
                ...Object.entries(actionLabels).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
              value={params.get("action") || ""}
              onChange={(action) => update({ action, page: "" })}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-label-sm">
              <thead>
                <tr className="text-text-secondary">
                  {["内容", "操作", "操作者", "时间"].map((label) => (
                    <th
                      key={label}
                      className="whitespace-nowrap p-lg font-medium"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.activity.docs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-lg">{log.title}</td>
                    <td className="whitespace-nowrap p-lg">
                      <Badge
                        label={actionLabels[log.action] || log.action}
                        variant="secondary"
                      />
                    </td>
                    <td className="whitespace-nowrap p-lg">{log.actor}</td>
                    <td className="whitespace-nowrap p-lg text-text-secondary">
                      {new Intl.DateTimeFormat("zh-CN", {
                        timeZone: "Asia/Shanghai",
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(log.occurredAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.activity.docs.length && (
              <Typography
                variant="small"
                className="py-2xl text-center text-text-secondary"
              >
                {busy
                  ? "正在读取…"
                  : error
                    ? "操作记录受权限保护。"
                    : "这个区间还没有操作记录。"}
              </Typography>
            )}
          </div>
          <div className="mt-xl flex flex-wrap items-center justify-between gap-lg">
            <Typography variant="meta" className="text-text-secondary">
              {data
                ? `共 ${data.activity.total} 条 · 第 ${data.activity.page} / ${data.activity.pages} 页`
                : "每页 10 条 · 真实操作记录"}
            </Typography>
            <div className="flex gap-sm">
              <Button
                variant="subtle"
                size="small"
                disabled={!data || data.activity.page <= 1}
                onClick={() =>
                  update({ page: String((data?.activity.page || 1) - 1) })
                }
              >
                上一页
              </Button>
              <Button
                variant="neutral"
                size="small"
                disabled={!data || data.activity.page >= data.activity.pages}
                onClick={() =>
                  update({ page: String((data?.activity.page || 1) + 1) })
                }
              >
                下一页
              </Button>
            </div>
          </div>
        </GlassSurface>
        <GlassSurface className="!p-2xl">
          <Typography as="h2" variant="card">
            内容的形状
          </Typography>
          <Typography variant="meta" className="mt-xs text-text-secondary">
            按所选区间文章分类统计
          </Typography>
          <div
            className="my-2xl flex h-(--space-md) overflow-hidden rounded-corner-full bg-bg-faint"
            aria-hidden="true"
          >
            {data?.distribution.map((item) => (
              <div
                key={item.id}
                className={`category-${item.id} bg-(--category-color)`}
                style={{ width: `${item.percent}%` }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-xl">
            {(
              data?.distribution || [
                { id: "go", label: "Go", percent: null, count: null },
                { id: "rust", label: "Rust", percent: null, count: null },
                {
                  id: "multimedia",
                  label: "音视频",
                  percent: null,
                  count: null,
                },
                {
                  id: "desktop",
                  label: "桌面开发",
                  percent: null,
                  count: null,
                },
              ]
            ).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-lg"
              >
                <span
                  className={`category-${item.id} flex items-center gap-md`}
                >
                  <span className="size-(--space-sm) rounded-corner-full bg-(--category-color)" />
                  <Typography as="span" variant="small">
                    {item.label}
                  </Typography>
                </span>
                <Typography variant="small" className="text-text-secondary">
                  {item.count ?? "—"} 篇 · {item.percent ?? "—"}%
                </Typography>
              </div>
            ))}
          </div>
          <AppLink to="/admin/collections/posts" className="text-link mt-2xl">
            管理文章
            <ArrowRight className="icon-sm" />
          </AppLink>
        </GlassSurface>
      </div>
      <GlassSurface className="!p-xl">
        <div className="flex flex-wrap items-center justify-between gap-xl">
          <div>
            <Typography variant="small">带走你的创作</Typography>
            <Typography variant="meta" className="text-text-secondary">
              导出区间内全部匹配内容 · UTF-8 CSV
            </Typography>
          </div>
          <div className="flex items-center gap-lg">
            <SelectField
              aria-label="导出类型"
              value={exportType}
              onChange={setExportType}
              options={[
                { value: "posts", label: "文章" },
                { value: "projects", label: "项目" },
                { value: "activity", label: "操作记录" },
              ]}
            />
            <Button
              variant="neutral"
              size="small"
              disabled={busy || !data}
              iconStart={<Download className="icon-sm" />}
              onClick={() => void exportCSV()}
            >
              导出内容
            </Button>
          </div>
        </div>
        {exportError && (
          <Typography
            variant="small"
            role="alert"
            className="mt-lg text-danger"
          >
            {exportError}
          </Typography>
        )}
      </GlassSurface>
      <Typography variant="meta" className="text-text-secondary">
        统计日期基准：发布日期，未发布时为创建日期。隐藏优先，公开发布／草稿／隐藏互斥。正式编辑请使用已发布站点的
        /admin。
      </Typography>
    </div>
  )
}
