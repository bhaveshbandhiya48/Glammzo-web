import "server-only"

import { processAppointmentCompletionRewards } from "@/lib/wallet/customer-wallet"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

/**
 * Find recently completed appointments that have not been reward-processed yet.
 * Prefer hard CRM status = completed only.
 */
export async function processPendingCompletionRewards(limit = 50): Promise<{
  scanned: number
  processed: number
  errors: number
}> {
  if (!isSupabaseConfigured()) {
    return { scanned: 0, processed: 0, errors: 0 }
  }

  const supabase = createAdminClient()
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()

  const { data: completed, error } = await supabase
    .from("appointments")
    .select("id")
    .eq("status", "completed")
    .is("deleted_at", null)
    .gte("updated_at", since)
    .order("updated_at", { ascending: false })
    .limit(limit)

  if (error) {
    // Some schemas may not have updated_at; fall back to starts_at window
    const fallback = await supabase
      .from("appointments")
      .select("id")
      .eq("status", "completed")
      .is("deleted_at", null)
      .gte("starts_at", since)
      .order("starts_at", { ascending: false })
      .limit(limit)

    if (fallback.error) {
      console.error("[wallet] list completed failed:", fallback.error.message)
      return { scanned: 0, processed: 0, errors: 1 }
    }

    return processIds((fallback.data ?? []).map((r) => r.id as string))
  }

  return processIds((completed ?? []).map((r) => r.id as string))
}

async function processIds(ids: string[]) {
  let processed = 0
  let errors = 0

  for (const id of ids) {
    const result = await processAppointmentCompletionRewards(id)
    if (!result.ok) {
      if (result.error !== "not_completed" && result.error !== "appointment_not_found") {
        errors += 1
      }
      continue
    }
    const payload = result.result as { already_processed?: boolean; ok?: boolean } | null
    if (payload?.ok && !payload.already_processed) {
      processed += 1
    }
  }

  return { scanned: ids.length, processed, errors }
}
