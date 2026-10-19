import assert from "node:assert/strict"
import { mkdir, readFile, writeFile } from "node:fs/promises"

const base = process.argv[2] || "http://localhost:3000"
const output = process.argv[3] || "/tmp/minhang-browser"
const matrix = process.argv.includes("--matrix")
await mkdir(output, { recursive: true })
const target = await fetch("http://localhost:9222/json/new?about:blank", {
  method: "PUT",
}).then((response) => response.json())
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true })
  socket.addEventListener("error", reject, { once: true })
})
let sequence = 0
const pending = new Map()
const exceptions = []
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data)
  if (message.id) {
    const item = pending.get(message.id)
    if (item) {
      clearTimeout(item.timer)
      pending.delete(message.id)
      message.error
        ? item.reject(new Error(message.error.message))
        : item.resolve(message.result)
    }
  }
  if (message.method === "Runtime.exceptionThrown") {
    const detail = message.params.exceptionDetails
    exceptions.push(
      (detail.exception?.description || detail.text).slice(0, 1000),
    )
  }
})
function send(method, params = {}) {
  const id = ++sequence
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error(`Browser command timed out: ${method}`))
    }, 30000)
    pending.set(id, { resolve, reject, timer })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  return result.result.value
}
async function settled() {
  await evaluate(`(async () => {
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 1200));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  })()`)
}
async function visit(route) {
  await send("Page.navigate", { url: `${base}${route}` })
  // Wait inside the browser, not a terminal polling loop.
  await new Promise((resolve) => setTimeout(resolve, 1200))
  await settled()
  const state = await evaluate(`({
    path: location.pathname,
    title: document.title,
    text: document.body.innerText,
    overflow: document.documentElement.scrollWidth > innerWidth,
    font: getComputedStyle(document.querySelector("main") || document.body).fontFamily,
    codeFont: document.querySelector("pre code") ? getComputedStyle(document.querySelector("pre code")).fontFamily : null,
    articles: document.querySelectorAll(".article-card").length,
    headings: Array.from(document.querySelectorAll(".prose-heading")).map(node => node.id),
    tables: document.querySelectorAll(".article-prose table").length,
    images: Array.from(document.querySelectorAll("main img")).map(img => ({ width: img.naturalWidth, height: img.naturalHeight })),
    passwordFields: document.querySelectorAll('input[type="password"]').length,
    emailFields: document.querySelectorAll('input[type="email"]').length
  })`)
  assert.ok(
    !state.text.includes("Build Error") &&
      !state.text.includes("Runtime Error"),
    `${route}: error overlay`,
  )
  assert.equal(state.overflow, false, `${route}: horizontal overflow`)
  console.error("Browser checked", route)
  return state
}
async function screenshot(name) {
  const result = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  })
  await writeFile(`${output}/${name}.png`, Buffer.from(result.data, "base64"))
}

await send("Page.enable")
await send("Runtime.enable")
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1050,
  deviceScaleFactor: 1,
  mobile: false,
})
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-color-scheme", value: "light" }],
})
const report = { base, pages: [], interactions: {}, matrix: [], exceptions }
try {
  await visit("/")
  await evaluate(`localStorage.setItem("astra-theme", "light")`)
  const home = await visit("/")
  assert.match(home.title, /敏航/)
  await screenshot("home-light")
  report.pages.push({ route: "/", ...home, text: home.text.slice(0, 180) })
  const blog = await visit("/blog")
  assert.equal(blog.articles, 6)
  await screenshot("blog-light")
  report.pages.push({ route: "/blog", ...blog, text: blog.text.slice(0, 180) })
  await evaluate(
    `Array.from(document.querySelectorAll(".filter-buttons button")).find(node => node.innerText.includes("Rust")).click()`,
  )
  await settled()
  report.interactions.categoryFilter = await evaluate(
    `({ count: document.querySelectorAll(".article-card").length, query: location.search })`,
  )
  assert.equal(report.interactions.categoryFilter.count, 2)
  await send("Page.navigate", { url: `${base}/blog?q=FFmpeg` })
  await new Promise((resolve) => setTimeout(resolve, 800))
  await settled()
  report.interactions.search = await evaluate(
    `({ count: document.querySelectorAll(".article-card").length, text: document.querySelector(".blog-result-summary")?.innerText })`,
  )
  assert.ok(report.interactions.search.count >= 1)
  const posts = JSON.parse(
    await readFile("/tmp/minhang-import/posts-read.json", "utf8"),
  ).result.docs
  const projects = JSON.parse(
    await readFile("/tmp/minhang-import/projects-read.json", "utf8"),
  ).result.docs
  const routes = [
    "/projects",
    "/about",
    "/design-system",
    "/404",
    "/_not-found",
    ...posts.map((post) => `/blog/${post.slug}`),
    ...projects.map((project) => `/projects/${project.slug}`),
  ]
  for (const route of routes) {
    const state = await visit(route)
    if (route.startsWith("/blog/")) {
      assert.ok(state.headings.length > 0, `${route}: missing headings`)
      assert.ok(
        state.codeFont?.includes("JetBrains"),
        `${route}: wrong code font`,
      )
    }
    report.pages.push({ route, ...state, text: state.text.slice(0, 120) })
    if (route === "/blog/go-worker-pool") await screenshot("article-light")
    if (route === "/projects/hongguo-manju-pc")
      await screenshot("project-light")
  }
  await visit("/")
  await evaluate(
    `document.querySelector('[aria-label="切换深色主题"]').click()`,
  )
  await settled()
  report.interactions.darkTheme = await evaluate(
    `document.documentElement.classList.contains("dark")`,
  )
  assert.equal(report.interactions.darkTheme, true)
  await screenshot("home-dark")
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  })
  const mobile = await visit("/")
  report.interactions.mobileOverflow = mobile.overflow
  report.interactions.themePersisted = await evaluate(
    `document.documentElement.classList.contains("dark")`,
  )
  assert.equal(report.interactions.themePersisted, true)
  await screenshot("home-mobile")
  await evaluate(
    `document.querySelector('[aria-label="打开导航菜单"]').click()`,
  )
  await settled()
  report.interactions.mobileMenu = await evaluate(
    `Boolean(document.getElementById("mobile-navigation"))`,
  )
  assert.equal(report.interactions.mobileMenu, true)
  await screenshot("mobile-navigation")
  if (matrix) {
    for (const [width, height, device] of [
      [1440, 1050, "desktop"],
      [900, 1100, "tablet"],
      [390, 844, "mobile"],
    ]) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: device === "mobile",
      })
      for (const theme of ["light", "dark"]) {
        if (device === "desktop" && theme === "light") continue
        await evaluate(
          `localStorage.setItem("astra-theme", ${JSON.stringify(theme)})`,
        )
        for (const route of ["/", "/blog", ...routes]) {
          const state = await visit(route)
          assert.ok(state.font.includes("Instrument Sans"))
          report.matrix.push({
            route,
            device,
            theme,
            overflow: state.overflow,
            title: state.title,
          })
          if (route === "/") await screenshot(`home-${device}-${theme}`)
          if (route === "/blog/go-worker-pool")
            await screenshot(`article-${device}-${theme}`)
        }
        console.error(`Completed ${device} / ${theme} route matrix`)
      }
    }
  }
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1050,
    deviceScaleFactor: 1,
    mobile: false,
  })
  const login = await visit("/admin/login")
  await screenshot("admin-login")
  report.pages.push({
    route: "/admin/login",
    ...login,
    text: login.text.slice(0, 1000),
  })
  assert.equal(exceptions.length, 0, exceptions.join("\n"))
  console.log(JSON.stringify(report, null, 2))
} finally {
  await writeFile(
    `${output}/report.json`,
    JSON.stringify(report, null, 2) + "\n",
  )
  socket.close()
}
