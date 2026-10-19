import { revalidateTag } from "next/cache"
import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type GlobalAfterChangeHook,
  type PayloadRequest,
} from "payload"
import { publishedContent } from "@/access/cms"
import {
  collectMediaIDs,
  lexicalPlainText,
  safeContentLink,
} from "@/lib/content/richtext"

function invalidate(
  collection?: string,
  ...slugs: (string | null | undefined)[]
) {
  // Only the initial CLI import opts out; never accept a client/context bypass.
  if (process.env.MINHANG_INITIAL_IMPORT === "1") return
  revalidateTag("public-content", { expire: 0 })
  if (collection) {
    revalidateTag(`${collection}:list`, { expire: 0 })
    for (const slug of new Set(slugs.filter(Boolean))) {
      revalidateTag(`${collection}:slug:${slug}`, { expire: 0 })
    }
  }
  revalidateTag("site-settings", { expire: 0 })
}

async function audit(
  req: PayloadRequest,
  entity: string,
  doc: Record<string, unknown>,
  action: string,
) {
  if (req.context.writingActivity) return
  await req.payload.create({
    collection: "activity-logs",
    overrideAccess: true,
    req,
    context: { ...req.context, writingActivity: true },
    data: {
      action,
      entity,
      documentID: String(doc.id ?? entity),
      title: String(doc.title ?? doc.siteTitle ?? doc.name ?? entity).slice(
        0,
        300,
      ),
      slugSnapshot: typeof doc.slug === "string" ? doc.slug : undefined,
      actor: req.user ? String(req.user.displayName || "后台成员") : "系统迁入",
      source: req.user ? "member" : "system",
      occurredAt: new Date().toISOString(),
    },
  })
}

export const prepareContent: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  collection,
}) => {
  const next = { ...originalDoc, ...data }
  const mediaIDs = collectMediaIDs(next.content, next.cover)
  for (const id of mediaIDs) {
    await req.payload.findByID({
      collection: "media",
      id,
      depth: 0,
      overrideAccess: true,
      req,
    })
  }
  data.mediaRefs = mediaIDs
  if (next._status === "published") {
    if (
      !next.title?.trim() ||
      !next.slug?.trim() ||
      !lexicalPlainText(next.content).trim()
    ) {
      throw new APIError("发布前请填写标题、固定链接和正文。", 400)
    }
    if (!next.publishedAt && process.env.MINHANG_INITIAL_IMPORT !== "1")
      data.publishedAt = new Date().toISOString()
    if (
      collection.slug === "posts" &&
      !["go", "rust", "multimedia", "desktop"].includes(next.category)
    ) {
      throw new APIError("发布文章前请选择有效分类。", 400)
    }
    if (
      collection.slug === "projects" &&
      next.visibility === "public" &&
      next.relatedPost
    ) {
      const id =
        typeof next.relatedPost === "object"
          ? next.relatedPost.id
          : next.relatedPost
      const related = await req.payload.find({
        collection: "posts",
        overrideAccess: true,
        req,
        draft: false,
        depth: 0,
        limit: 1,
        where: { and: [publishedContent, { id: { equals: id } }] },
      })
      if (!related.totalDocs)
        throw new APIError(
          "公开项目只能关联当前已公开发布的文章，请先发布文章或解除关系。",
          400,
        )
    }
  }
  for (const field of ["sourceUrl", "demoUrl", "downloadUrl"]) {
    if (next[field] && !safeContentLink(next[field], true)) {
      throw new APIError("项目外部链接必须使用有效的 HTTPS 地址。", 400)
    }
  }
  return data
}

export const contentChanged: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  collection,
  req,
  operation,
}) => {
  invalidate(collection.slug, previousDoc?.slug, doc.slug)
  const persisted = await req.payload.findByID({
    collection: collection.slug as "posts" | "projects",
    id: doc.id,
    draft: false,
    depth: 0,
    overrideAccess: true,
    req,
    select: { _status: true, visibility: true },
  })
  const action =
    operation === "create"
      ? "create"
      : doc._status === "published" && previousDoc?._status !== "published"
        ? "publish"
        : persisted._status === "draft" && previousDoc?._status === "published"
          ? "unpublish"
          : doc._status === "published" &&
              previousDoc?.visibility !== doc.visibility &&
              persisted.visibility === "hidden"
            ? "hide"
            : "update"
  await audit(req, collection.slug, doc, action)
  return doc
}

export const contentDeleted: CollectionAfterDeleteHook = async ({
  doc,
  collection,
  req,
}) => {
  invalidate(collection.slug, doc.slug)
  await audit(req, collection.slug, doc, "delete")
  return doc
}

export const resourceChanged: CollectionAfterChangeHook = async ({
  doc,
  collection,
  req,
  operation,
}) => {
  invalidate()
  await audit(
    req,
    collection.slug,
    doc,
    operation === "create" ? "create" : "update",
  )
  return doc
}

export const resourceDeleted: CollectionAfterDeleteHook = async ({
  doc,
  collection,
  req,
}) => {
  invalidate()
  await audit(req, collection.slug, doc, "delete")
  return doc
}

export const settingsChanged: GlobalAfterChangeHook = async ({ doc, req }) => {
  invalidate()
  await audit(req, "site-settings", doc, "settings")
  return doc
}

export const protectReferencedResource: CollectionBeforeDeleteHook = async ({
  collection,
  id,
  req,
}) => {
  const field = collection.slug === "tags" ? "_h_tags" : "mediaRefs"
  for (const slug of ["posts", "projects"] as const) {
    for (const draft of [false, true]) {
      const result = await req.payload.find({
        collection: slug,
        depth: 0,
        draft,
        limit: 1,
        overrideAccess: true,
        req,
        where: { [field]: { in: [id] } },
        select: { title: true },
      })
      if (result.totalDocs)
        throw new APIError(
          `仍被「${result.docs[0].title}」引用，请先解除引用。`,
          409,
        )
    }
    // Historical versions must remain valid and previewable as well.
    const versions = await req.payload.findVersions({
      collection: slug,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: { [`version.${field}`]: { in: [id] } },
    })
    if (versions.totalDocs)
      throw new APIError("仍被历史版本引用，不能删除。", 409)
  }
  if (collection.slug === "media") {
    const settings = await req.payload.findGlobal({
      slug: "site-settings",
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (collectMediaIDs(settings.about, settings.avatar).includes(String(id))) {
      throw new APIError("网站设置仍在使用此媒体。", 409)
    }
  }
}

export async function publiclyReferencedIDs(
  req: PayloadRequest,
  field: "mediaRefs" | "tags",
) {
  const key = `public-references:${field}`
  const saved = req.context[key]
  if (Array.isArray(saved)) return saved
  const ids = new Set<string>()
  for (const collection of ["posts", "projects"] as const) {
    const result = await req.payload.find({
      collection,
      depth: 0,
      draft: false,
      pagination: false,
      overrideAccess: true,
      req,
      where: publishedContent,
      select: { [field === "tags" ? "_h_tags" : field]: true },
    })
    for (const doc of result.docs) {
      const values = (doc as unknown as Record<string, unknown>)[
        field === "tags" ? "_h_tags" : field
      ]
      if (Array.isArray(values)) {
        for (const value of values)
          ids.add(String(typeof value === "object" && value ? value.id : value))
      }
    }
  }
  if (field === "mediaRefs") {
    const settings = await req.payload.findGlobal({
      slug: "site-settings",
      depth: 0,
      overrideAccess: true,
      req,
    })
    for (const id of collectMediaIDs(settings.about, settings.avatar))
      ids.add(id)
  }
  const result = [...ids]
  req.context[key] = result
  return result
}
