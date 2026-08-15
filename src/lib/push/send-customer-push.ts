import "server-only"

import { listMobilePushTokensForPhone } from "@/lib/push/mobile-push-tokens"

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

export type CustomerPushPayload = {
  title: string
  body: string
  data?: Record<string, unknown>
  /** Deep link path inside the app, e.g. /(tabs)/bookings */
  href?: string
}

type ExpoTicket = {
  status?: string
  id?: string
  message?: string
  details?: { error?: string }
}

/**
 * Send an Expo push to all registered devices for a consumer phone.
 * Fire-and-forget safe: never throws to callers.
 */
export async function sendCustomerPush(
  phone: string,
  payload: CustomerPushPayload,
): Promise<{ sent: number }> {
  try {
    const tokens = await listMobilePushTokensForPhone(phone)
    if (tokens.length === 0) return { sent: 0 }

    const messages = tokens.map((to) => ({
      to,
      sound: "default" as const,
      title: payload.title,
      body: payload.body,
      data: {
        ...(payload.data ?? {}),
        ...(payload.href ? { href: payload.href } : {}),
      },
      channelId: "glammzo-default",
    }))

    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      console.error("[mobile-push] Expo send HTTP", response.status, text)
      return { sent: 0 }
    }

    const json = (await response.json()) as { data?: ExpoTicket | ExpoTicket[] }
    const tickets = Array.isArray(json.data) ? json.data : json.data ? [json.data] : []
    const sent = tickets.filter((t) => t.status === "ok").length

    for (const ticket of tickets) {
      if (ticket.status === "error") {
        console.warn("[mobile-push] ticket error:", ticket.message, ticket.details)
      }
    }

    return { sent }
  } catch (error) {
    console.error("[mobile-push] send failed:", error)
    return { sent: 0 }
  }
}

/** Non-blocking wrapper for route handlers. */
export function queueCustomerPush(phone: string, payload: CustomerPushPayload) {
  void sendCustomerPush(phone, payload)
}
