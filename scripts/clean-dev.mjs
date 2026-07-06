import { execSync } from "node:child_process"
import { existsSync, rmSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const nextDir = join(root, ".next")

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function killPort(port) {
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" })
      const pids = new Set()
      for (const line of out.split("\n")) {
        if (!line.includes("LISTENING")) continue
        const pid = line.trim().split(/\s+/).pop()
        if (pid && /^\d+$/.test(pid)) pids.add(pid)
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" })
          console.log(`Stopped process ${pid} on port ${port}`)
        } catch {
          /* already stopped */
        }
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, {
        shell: true,
        stdio: "ignore",
      })
    }
  } catch {
    /* port not in use */
  }
}

function removeNextDirWindows() {
  try {
    execSync(
      `powershell -NoProfile -Command "if (Test-Path '.next') { Remove-Item -LiteralPath '.next' -Recurse -Force }"`,
      { cwd: root, stdio: "ignore" }
    )
    return !existsSync(nextDir)
  } catch {
    return false
  }
}

async function removeNextDir() {
  if (!existsSync(nextDir)) return true

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      rmSync(nextDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
      console.log("Removed .next cache")
      return true
    } catch {
      if (process.platform === "win32" && removeNextDirWindows()) {
        console.log("Removed .next cache (PowerShell)")
        return true
      }
      if (attempt === 5) {
        console.error("Could not remove .next.")
        console.error("Close all terminals running `npm run dev`, then delete the .next folder manually.")
        return false
      }
      console.log(`Retrying .next cleanup (${attempt}/5)...`)
      await sleep(400 * attempt)
    }
  }
  return false
}

async function main() {
  for (const port of [3000, 3001, 3002]) killPort(port)
  await sleep(600)
  const ok = await removeNextDir()
  try {
    const lock = join(root, ".next-dev.lock")
    if (existsSync(lock)) unlinkSync(lock)
  } catch {
    /* ignore */
  }
  console.log(ok ? "Dev environment cleaned." : "Cleanup incomplete — close other dev terminals.")
  if (!ok) process.exit(1)
}

main()
