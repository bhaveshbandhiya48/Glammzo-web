import { processConsumerBookingReminders } from "@/lib/bookings/crm/process-booking-reminders"

export const runtime = "nodejs"

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== "production"

  const header = request.headers.get("authorization")
  return header === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
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
