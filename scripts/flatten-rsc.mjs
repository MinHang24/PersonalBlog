// 把 RSC 目录结构文件复制为扁平点号命名（Next.js 16 静态导出兼容）
// 用法：node scripts/flatten-rsc.mjs（build 后自动跑，见 package.json）
import { readdirSync, statSync, copyFileSync } from "node:fs"
import { join, sep } from "node:path"

let count = 0

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p)
    else if (name === "__PAGE__.txt") flatten(p)
  }
}

function flatten(src) {
  const parts = src.split(sep)
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith("__next.")) {
      const hashSeg = parts[i]
      const route = parts.slice(i + 1, -1).join(".")
      const flatName = `${hashSeg}.${route}.__PAGE__.txt`
      const flatDir = parts.slice(0, i).join(sep)
      copyFileSync(src, join(flatDir, flatName))
      count++
    }
  }
}

walk("out")
console.log(`[flatten-rsc] 生成扁平副本 ${count} 个`)
