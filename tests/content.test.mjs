import assert from "node:assert/strict"
import test from "node:test"
import {
  blocksToLexical,
  collectMediaIDs,
  contentHeadings,
  legacyAnchors,
  lexicalPlainText,
  safeContentLink,
} from "../src/lib/content/richtext.ts"
import {
  comparison,
  dateBounds,
  displayState,
  inDateRange,
  parseCmsFilters,
  shanghaiDate,
  trendKey,
  validDate,
} from "../src/lib/cms/filters.ts"
import { csvCell, csvDocument } from "../src/lib/cms/csv.ts"

test("legacy heading anchors survive conversion and duplicate headings stay unique", () => {
  const blocks = [
    { kind: "heading", level: 2, text: "并发的边界", id: "original-boundary" },
    {
      kind: "heading",
      level: 3,
      text: "并发的边界",
      id: "original-boundary-2",
    },
    {
      kind: "paragraph",
      content: [
        "保留",
        { kind: "strong", text: "语义" },
        { kind: "code", text: "ctx.Done()" },
      ],
    },
    { kind: "code", language: "go", code: "go func() {\n  work()\n}()" },
    { kind: "table", headers: ["参数", "含义"], rows: [["ctx", "取消"]] },
  ]
  const doc = blocksToLexical(blocks)
  assert.deepEqual(
    contentHeadings(doc, legacyAnchors(blocks)).map((row) => row.id),
    ["original-boundary", "original-boundary-2"],
  )
  assert.match(lexicalPlainText(doc), /ctx.Done\(\)/)
  assert.match(lexicalPlainText(doc), /work\(\)/)
  assert.equal(doc.root.children[4].type, "table")
  assert.deepEqual(
    contentHeadings(doc).map((row) => row.id),
    ["并发的边界", "并发的边界-2"],
  )
})

test("links cannot become script URLs, credentials, protocol-relative URLs or backslash redirects", () => {
  for (const value of [
    "javascript:alert(1)",
    "//evil.test",
    "/\\evil.test",
    "https://user:pass@example.test",
    "http://example.test",
    " https://example.test",
  ]) {
    assert.equal(safeContentLink(value), null)
  }
  assert.equal(safeContentLink("/blog/my-post"), "/blog/my-post")
  assert.equal(
    safeContentLink("https://example.test/path", true),
    "https://example.test/path",
  )
  assert.equal(safeContentLink("/blog/my-post", true), null)
})

test("server-derived media references deduplicate and preserve string IDs", () => {
  const doc = {
    root: {
      type: "root",
      children: [
        { type: "upload", relationTo: "media", value: { id: "media-A" } },
        { type: "upload", relationTo: "media", value: "media-B" },
        { type: "relationship", relationTo: "admins", value: "not-a-media" },
      ],
    },
  }
  assert.deepEqual(collectMediaIDs(doc, "media-A"), ["media-A", "media-B"])
})

test("date ranges use Shanghai boundaries, leap days and ISO Monday buckets", () => {
  assert.equal(validDate("2024-02-29"), true)
  assert.equal(validDate("2025-02-29"), false)
  assert.equal(shanghaiDate(new Date("2025-01-01T16:01:00Z")), "2025-01-02")
  assert.deepEqual(dateBounds("2025-01-01", "2025-01-01"), {
    greater_than_equal: "2024-12-31T16:00:00.000Z",
    less_than: "2025-01-01T16:00:00.000Z",
  })
  assert.equal(
    inDateRange("2025-01-01T16:00:00Z", {
      from: "2025-01-01",
      to: "2025-01-01",
    }),
    false,
  )
  assert.equal(trendKey("2025-01-05T04:00:00Z", "week"), "2024-12-30")
  assert.throws(() =>
    parseCmsFilters(new URLSearchParams("from=2025-02-01&to=2025-01-01")),
  )
  assert.throws(() => parseCmsFilters(new URLSearchParams("action=drop")))
  assert.equal(parseCmsFilters(new URLSearchParams()).allTime, true)
})

test("metric states are mutually exclusive and zero baselines do not invent growth", () => {
  assert.equal(
    displayState({ visibility: "hidden", _status: "draft" }),
    "hidden",
  )
  assert.equal(
    displayState({ visibility: "public", _status: "published" }),
    "published",
  )
  assert.equal(
    displayState({ visibility: "public", _status: "draft" }),
    "draft",
  )
  assert.equal(comparison(4, 0, false), "新增")
  assert.equal(comparison(0, 0, false), "无变化")
  assert.equal(comparison(5, 100, true), "累计")
})

test("CSV includes BOM and neutralizes spreadsheet formulas while preserving quoted prose", () => {
  assert.equal(csvCell('hello, "world"'), '"hello, ""world"""')
  assert.equal(csvCell("  =SUM(A1)"), '"\'  =SUM(A1)"')
  assert.equal(csvCell("@cmd"), '"\'@cmd"')
  assert.ok(csvDocument(["标题"], [["敏航"]]).startsWith("\uFEFF"))
})
