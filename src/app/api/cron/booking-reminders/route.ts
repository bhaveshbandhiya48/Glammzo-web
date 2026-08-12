import { processConsumerBookingReminders } from "@/lib/bookings/crm/process-booking-reminders"
import { processConsumerBookingOutcomeNotices } from "@/lib/bookings/crm/process-booking-outcome-notices"
import { processPendingCompletionRewards } from "@/lib/wallet/process-completion-rewards"
import { isCronRequestAuthorized } from "@/lib/env/cron-auth"

export const runtime = "nodejs"

/**
 * Wallet rewards + reserved consumer-notice hooks.
 * SMS reminders/outcomes are no-ops (CRM WhatsApp is the messaging channel).
 */
export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [remindersSent, outcomeSent, rewards] = await Promise.all([
      processConsumerBookingReminders(),
      processConsumerBookingOutcomeNotices(),
      processPendingCompletionRewards(40),
    ])
    return Response.json({
      ok: true,
      sent: remindersSent,
      outcomeNoticesSent: outcomeSent,
      walletRewards: rewards,
    })
  } catch (error) {
    console.error("[cron] booking reminders failed:", error)
    return Response.json({ error: "Failed to process reminders" }, { status: 500 })
  }
}
