import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import { cancelMobileBooking } from "@/lib/bookings/mobile-bookings"
import { queueCustomerPush } from "@/lib/push/send-customer-push"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Ctx) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) return jsonError(401, "Sign in required.")
    const { id } = await context.params

    let body: Record<string, unknown> = {}
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      body = {}
    }

    const result = await cancelMobileBooking({
      phone: session.phone,
      bookingId: id,
      reasonId: typeof body.reasonId === "string" ? body.reasonId : "change_of_plans",
      details: typeof body.details === "string" ? body.details : undefined,
    })

    if (!result.ok) {
      return jsonError(400, result.error, { code: result.code })
    }

    queueCustomerPush(session.phone, {
      title: "Booking cancelled",
      body: "Your appointment was cancelled. Open Glammzo to book again anytime.",
      href: "/(tabs)/bookings",
      data: { type: "booking_cancelled", bookingId: id },
    })

    return jsonOk({ cancelled: true })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/bookings/:id/cancel]", error)
    return jsonError(500, "Could not cancel booking.")
  }
}
