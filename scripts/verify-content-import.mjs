import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import ts from "typescript"

const directory = process.argv[2] || "/tmp/minhang-import"
const result = async (name) => {
  const response = JSON.parse(await readFile(`${directory}/${name}`, "utf8"))
  assert.equal(response.success, true)
  return response.result
}
const loadTS = async (file) => {
  const { outputText } = ts.transpileModule(await readFile(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  })
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  )
}
const { lexicalPlainText, legacyAnchors, contentHeadings } = await loadTS(
  "src/lib/content/richtext.ts",
)
const posts = (await result("posts-read.json")).docs
const projects = (await result("projects-read.json")).docs
const tags = (await result("tags-read.json")).docs
assert.equal(posts.length, 9)
assert.equal(projects.length, 3)
assert.equal(tags.length, 23)
assert.equal(new Set(posts.map((post) => post.slug)).size, 9)
const tagByID = new Map(tags.map((tag) => [tag.id, tag.name]))
const files = (await readdir("src/content/articles")).filter(
  (file) => file.endsWith(".ts") && file !== "index.ts",
)
for (const file of files) {
  const { article } = await loadTS(`src/content/articles/${file}`)
  const stored = posts.find((post) => post.slug === article.slug)
  assert.ok(stored, article.slug)
  assert.equal(typeof stored.id, "string")
  assert.equal(stored.title, article.title)
  assert.equal(stored.excerpt, article.excerpt)
  assert.equal(stored.category, article.category)
  assert.equal(stored._status, "published")
  assert.equal(stored.visibility, "public")
  assert.equal(
    new Date(stored.publishedAt).getTime(),
    new Date(`${article.publishedAt}T00:00:00+08:00`).getTime(),
  )
  assert.deepEqual(
    stored._h_tags.map((id) => tagByID.get(id)),
    article.tags,
  )
  assert.deepEqual(stored.legacyHeadingAnchors, legacyAnchors(article.blocks))
  assert.deepEqual(
    contentHeadings(stored.content, stored.legacyHeadingAnchors).map(
      (heading) => heading.id,
    ),
    article.blocks
      .filter((block) => block.kind === "heading")
      .map((block) => block.id),
  )
  const text = lexicalPlainText(stored.content)
  for (const block of article.blocks) {
    if (block.kind === "code") {
      assert.ok(
        text.includes(block.code),
        `${article.slug}: code contents changed`,
      )
      const node = stored.content.root.children.find(
        (node) => node.type === "block" && node.fields.code === block.code,
      )
      assert.ok(node)
      assert.equal(
        node.fields.language,
        block.language === "text" ? "plaintext" : block.language,
      )
    }
    if (block.kind === "table") {
      assert.ok(
        stored.content.root.children.some((node) => node.type === "table"),
      )
      for (const cell of [...block.headers, ...block.rows.flat()])
        assert.ok(text.includes(cell))
    }
    if (block.kind === "paragraph" || block.kind === "quote") {
      for (const part of block.content)
        assert.ok(text.includes(typeof part === "string" ? part : part.text))
    }
  }
}
const originalProjects = (await loadTS("src/content/projects.ts")).projects
for (const project of originalProjects) {
  const stored = projects.find((record) => record.slug === project.id)
  assert.ok(stored)
  assert.equal(stored.title, project.title)
  assert.equal(stored.description, project.description)
  assert.equal(stored.isSample, project.isSample)
  assert.equal(stored.featured, project.featured)
  assert.equal(stored._status, "published")
  assert.equal(stored.visibility, "public")
  assert.deepEqual(
    stored.highlights.map((row) => row.text),
    project.highlights,
  )
  assert.equal(
    stored.relatedPost,
    posts.find((post) => post.slug === project.articleSlug).id,
  )
}
const settings = await result("settings-read.json")
assert.equal(settings.authorName, "敏航")
assert.equal(settings.siteTitle, "敏航的手记")
assert.equal(settings.expertise.length, 4)
assert.equal(settings.techStack.length, 6)
const logs = await result("activity-read.json")
assert.equal(logs.totalDocs, 37)
assert.ok(logs.docs.every((log) => log.source === "system"))
console.log(
  JSON.stringify({
    verifiedArticles: posts.length,
    verifiedProjects: projects.length,
    verifiedTags: tags.length,
    verifiedAuditEntries: logs.totalDocs,
    datesAndAnchorsPreserved: true,
    codeAndTableContentsPreserved: true,
    projectRelationshipsVerified: true,
  }),
)
