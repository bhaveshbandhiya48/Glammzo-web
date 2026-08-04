import { processPendingCompletionRewards } from "@/lib/wallet/process-completion-rewards"
import { isCronRequestAuthorized } from "@/lib/env/cron-auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await processPendingCompletionRewards(80)
    return Response.json({ ok: true, ...result })
  } catch (error) {
    console.error("[cron] wallet rewards failed:", error)
    return Response.json({ error: "Failed to process rewards" }, { status: 500 })
  }
}
