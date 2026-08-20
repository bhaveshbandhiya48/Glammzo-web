import "server-only"

import { getGlamzzoCrmUrl } from "@/lib/crm/glamzzo-crm-url"

/**
 * Ask glamzzo-crm to:
 * - expire past-deadline pending web bookings
 * - send pending-owner / auto-confirmed WhatsApp via Meta
 * - send owner + customer WhatsApp for recent customer cancels
 *
 * Uses the same CRON_SECRET as CRM. No-ops if secret is missing.
 */
export async function triggerCrmExpiredWebBookingsCron(): Promise<void> {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    console.warn(
      "[bookings] CRM WhatsApp/expire cron skipped: CRON_SECRET is not set",
    )
    return
  }

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
      return
    }

    const body = (await response.json().catch(() => null)) as {
      autoConfirmedNotifies?: number
      ownerPendingNotifies?: number
      customerCancelSalons?: number
    } | null

    if (body) {
      console.info(
        "[bookings] CRM expire cron ok:",
        `autoConfirmed=${body.autoConfirmedNotifies ?? "?"}`,
        `ownerPending=${body.ownerPendingNotifies ?? "?"}`,
        `customerCancelSalons=${body.customerCancelSalons ?? "?"}`,
      )
    }
  } catch (error) {
    console.error(
      "[bookings] CRM expire cron request error (is glamzzo-crm running?):",
      error,
    )
  }
}
