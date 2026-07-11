/**
 * Free ports used by Next.js dev (avoids two servers + stale cache loops).
 */
import { execSync } from "node:child_process"

import { DEV_PORTS_TO_KILL } from "./dev-port.mjs"

function killPortWin(port) {
  try {
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
        console.log(`[glamzzo] Freed port ${port} (PID ${pid})`)
      } catch {
        /* already stopped */
      }
    }
  } catch {
    /* port not in use */
  }
}

function killPortUnix(port) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, {
      shell: true,
      stdio: "ignore",
    })
  } catch {
    /* ignore */
  }
}

for (const port of DEV_PORTS_TO_KILL) {
  if (process.platform === "win32") killPortWin(port)
  else killPortUnix(port)
}
