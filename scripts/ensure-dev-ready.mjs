/**
 * Runs automatically before `npm run dev`.
 * Clears .next only when it would cause runtime errors (mixed prod/dev cache, etc.).
 */
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

import { cleanNext, shouldClearBeforeDev } from "./clean-next.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function stopStaleDevServers() {
  try {
    execSync("node scripts/kill-dev-ports.mjs", { cwd: root, stdio: "inherit" })
  } catch {
    /* ports already free */
  }
}

// Always free 3000/3001 so a zombie dev process cannot serve broken chunks after cache changes.
stopStaleDevServers()

if (shouldClearBeforeDev()) {
  cleanNext({
    reason:
      "Clearing stale .next cache (required after `npm run build` or when chunk errors appear)",
  })
}
