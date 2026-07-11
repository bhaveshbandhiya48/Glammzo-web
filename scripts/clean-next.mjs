/**
 * Remove .next safely (Windows-friendly).
 * Used before production builds and when dev cache is stale.
 */
import { execSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const nextDir = join(root, ".next")

function removeNextDirWindows() {
  try {
    execSync(
      `powershell -NoProfile -Command "if (Test-Path '.next') { Remove-Item -LiteralPath '.next' -Recurse -Force -ErrorAction SilentlyContinue }"`,
      { cwd: root, stdio: "ignore" }
    )
    return !existsSync(nextDir)
  } catch {
    return false
  }
}

export function removeNextDir() {
  if (!existsSync(nextDir)) return true

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      rmSync(nextDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 })
      return true
    } catch {
      if (process.platform === "win32" && removeNextDirWindows()) return true
    }
  }
  return false
}

/** Production build + dev hot-update in the same folder → missing chunk errors (e.g. ./331.js). */
export function isMixedDevAndProdCache() {
  if (!existsSync(join(nextDir, "BUILD_ID"))) return false

  const devMarkers = [
    join(nextDir, "static", "webpack"),
    join(nextDir, "static", "development"),
  ]
  return devMarkers.some((p) => existsSync(p))
}

/**
 * Webpack runtime references chunks that are missing on disk.
 * Production chunks live under server/chunks/, not server/.
 */
export function hasBrokenWebpackChunks() {
  const runtimePath = join(nextDir, "server", "webpack-runtime.js")
  if (!existsSync(runtimePath)) return false

  let content
  try {
    content = readFileSync(runtimePath, "utf8")
  } catch {
    return true
  }

  const usesChunksDir = content.includes("./chunks/")
  const serverDir = join(nextDir, "server")
  const chunksDir = join(serverDir, "chunks")

  const ids = new Set()
  const legacyRe = /['"]\.\/(\d+)\.js['"]/g
  let m
  while ((m = legacyRe.exec(content)) !== null) {
    ids.add(m[1])
  }

  for (const id of ids) {
    const legacy = join(serverDir, `${id}.js`)
    const modern = join(chunksDir, `${id}.js`)
    if (usesChunksDir) {
      if (!existsSync(modern) && !existsSync(legacy)) return true
    } else if (!existsSync(legacy)) {
      return true
    }
  }

  return false
}

export function shouldClearBeforeDev() {
  if (!existsSync(nextDir)) return false
  if (existsSync(join(nextDir, "BUILD_ID"))) return true
  if (isMixedDevAndProdCache()) return true
  if (hasBrokenWebpackChunks()) return true
  return false
}

export function cleanNext({ reason, exitOnFailure = true } = {}) {
  if (!existsSync(nextDir)) return true
  if (reason) console.log(`[glamzzo] ${reason}`)
  const ok = removeNextDir()
  if (!ok) {
    console.error(
      "[glamzzo] Could not remove .next — stop other dev servers (port 4008), close the folder in your editor, then run: npm run clean"
    )
    if (exitOnFailure) process.exit(1)
    return false
  }
  console.log("[glamzzo] Removed .next")
  return true
}

const isMain =
  process.argv[1]?.includes("clean-next.mjs") &&
  !process.argv[1]?.includes("ensure-dev-ready")

if (isMain) {
  cleanNext({ reason: "Clearing .next cache" })
}
