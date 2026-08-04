import "server-only"

import { getGlamzzoCrmUrl } from "@/lib/crm/glamzzo-crm-url"

/**
 * Ask glamzzo-crm to flip past-deadline pending web bookings to expired
 * (and send customer WhatsApp). Uses the same CRON_SECRET as CRM.
 */
export async function triggerCrmExpiredWebBookingsCron(): Promise<void> {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return

  const url = `${getGlamzzoCrmUrl()}/api/cron/expired-web-bookings`

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(
        "[bookings] CRM expire cron failed:",
        response.status,
        await response.text().catch(() => ""),
      )
    }
  } catch (error) {
    console.error("[bookings] CRM expire cron request error:", error)
  }
}
