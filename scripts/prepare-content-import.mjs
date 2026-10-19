/**
 * Offline conversion only. Produces reviewed JSON inputs for the official
 * Payload CLI; never connects to Payload, a REST endpoint or a database.
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import path from "node:path"
import ts from "typescript"

const destination = process.argv[2]
if (!destination)
  throw new Error(
    "Usage: node scripts/prepare-content-import.mjs /tmp/destination",
  )
await mkdir(destination, { recursive: true })
const loadTS = async (file) => {
  const input = await readFile(file, "utf8")
  const { outputText } = ts.transpileModule(input, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  })
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  )
}
const output = async (name, value) =>
  writeFile(path.join(destination, name), JSON.stringify(value, null, 2) + "\n")
const readResult = async (name) => {
  try {
    const result = JSON.parse(
      await readFile(path.join(destination, name), "utf8"),
    )
    if (!result.success) throw new Error(`Unsuccessful CLI read: ${name}`)
    return result.result.docs
  } catch (error) {
    if (error.code === "ENOENT") return null
    throw error
  }
}
const articleFiles = (await readdir("src/content/articles")).filter(
  (file) => file.endsWith(".ts") && file !== "index.ts",
)
const articles = (
  await Promise.all(
    articleFiles.map(
      async (file) => (await loadTS(`src/content/articles/${file}`)).article,
    ),
  )
).sort(
  (a, b) =>
    b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug),
)
const { projects } = await loadTS("src/content/projects.ts")
const { site } = await loadTS("src/content/site.ts")
const { blocksToLexical, legacyAnchors } = await loadTS(
  "src/lib/content/richtext.ts",
)
const normalized = (name) => name.trim().normalize("NFKC").toLocaleLowerCase()
const tagNames = new Map()
for (const item of [...articles, ...projects]) {
  for (const name of item.tags)
    if (!tagNames.has(normalized(name)))
      tagNames.set(normalized(name), name.trim())
}
const existingTags = await readResult("tags-read.json")
const tagIDs = new Map(
  (existingTags || []).map((tag) => [normalized(tag.name), tag.id]),
)
await output("tags-create.json", {
  slug: "tags",
  documents: [...tagNames]
    .filter(([key]) => !tagIDs.has(key))
    .map(([, name]) => ({ data: { name } })),
})
const { avatarUrl, expertise, ...settings } = site
await output("site-settings.json", {
  slug: "site-settings",
  data: {
    ...settings,
    about: blocksToLexical([
      {
        kind: "paragraph",
        content: [
          "我相信，好的代码与好的体验不是两件事。一个边界清楚的函数、一次恰到好处的反馈、一份能帮到别人的笔记，都让构建这件事更有意义。",
        ],
      },
    ]),
    expertise: expertise.map(({ id, ...item }) => ({ key: id, ...item })),
  },
})
const zip = await readFile("public/developer-blog-astro.zip").catch((error) => {
  if (error.code !== "ENOENT") throw error
  return null
})
if (zip)
  await output("download-create.json", {
    slug: "protected-downloads",
    documents: [
      {
        data: {
          name: "下载完整 Astro 源码",
          description:
            "迁移前的完整 Astro 5 源码资料（含九篇文章）；不是当前 Next.js 项目的源码导出。",
          sha256: createHash("sha256").update(zip).digest("hex"),
        },
        file: "public/developer-blog-astro.zip",
      },
    ],
  })
if (existingTags) {
  const tagsFor = (item) =>
    item.tags.map((name) => {
      const id = tagIDs.get(normalized(name))
      if (!id) throw new Error(`Missing persisted tag: ${name}`)
      return id
    })
  const existingPosts = await readResult("posts-read.json")
  const bySlug = new Map(
    (existingPosts || []).map((post) => [post.slug, post.id]),
  )
  const documents = articles
    .filter((article) => !bySlug.has(article.slug))
    .map((article) => ({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        category: article.category,
        _h_tags: tagsFor(article),
        content: blocksToLexical(article.blocks),
        legacyHeadingAnchors: legacyAnchors(article.blocks),
        publishedAt: `${article.publishedAt}T00:00:00+08:00`,
        featured: article.slug === "hongguo-manju-desktop-notes",
        visibility: "public",
        _status: "published",
      },
    }))
  await output("posts-create.json", { slug: "posts", documents, draft: false })
  const representative = documents.find((item) =>
    item.data.content.root.children.some((node) => node.type === "table"),
  )
  if (representative)
    await output("post-representative.json", {
      slug: "posts",
      documents: [representative],
      draft: false,
    })
  if (
    existingPosts &&
    projects.every((project) => bySlug.has(project.articleSlug))
  ) {
    const existingProjects = await readResult("projects-read.json")
    const projectSlugs = new Set(
      (existingProjects || []).map((project) => project.slug),
    )
    await output("projects-create.json", {
      slug: "projects",
      draft: false,
      documents: projects
        .filter((project) => !projectSlugs.has(project.id))
        .map((project) => {
          const relatedPost = bySlug.get(project.articleSlug)
          if (!relatedPost)
            throw new Error(
              `Missing persisted related article: ${project.articleSlug}`,
            )
          return {
            data: {
              title: project.title,
              slug: project.id,
              description: project.description,
              _h_tags: tagsFor(project),
              featured: project.featured,
              isSample: project.isSample,
              relatedPost,
              highlights: project.highlights.map((text) => ({ text })),
              visibility: "public",
              _status: "published",
              content: blocksToLexical([
                { kind: "paragraph", content: [project.description] },
                {
                  kind: "heading",
                  level: 2,
                  id: "highlights",
                  text: "项目亮点",
                },
                {
                  kind: "list",
                  items: project.highlights.map((text) => [text]),
                },
                {
                  kind: "paragraph",
                  content: [
                    {
                      kind: "link",
                      text: "阅读关联实践笔记",
                      href: `/blog/${project.articleSlug}`,
                    },
                  ],
                },
              ]),
            },
          }
        }),
    })
  }
}
console.log(
  JSON.stringify({
    articles: articles.length,
    projects: projects.length,
    uniqueTags: tagNames.size,
    persistedTags: tagIDs.size,
    outputDirectory: destination,
  }),
)
