import { processConsumerBookingReminders } from "@/lib/bookings/crm/process-booking-reminders"
import { isCronRequestAuthorized } from "@/lib/env/cron-auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const sent = await processConsumerBookingReminders()
    return Response.json({ ok: true, sent })
  } catch (error) {
    console.error("[cron] booking reminders failed:", error)
    return Response.json({ error: "Failed to process reminders" }, { status: 500 })
  }
}
