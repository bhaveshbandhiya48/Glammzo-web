import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import { rescheduleMobileBooking } from "@/lib/bookings/mobile-bookings"
import { queueCustomerPush } from "@/lib/push/send-customer-push"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Ctx) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) return jsonError(401, "Sign in required.")
    const { id } = await context.params

    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      return jsonError(400, "Invalid JSON body.")
    }

    const result = await rescheduleMobileBooking({
      phone: session.phone,
      appointmentId: id,
      date: typeof body.date === "string" ? body.date : "",
      time: typeof body.time === "string" ? body.time : "",
    })

    if (!result.ok) {
      return jsonError(400, result.error, { code: result.code })
    }

    queueCustomerPush(session.phone, {
      title: "Booking rescheduled",
      body: `Your appointment was moved to ${typeof body.date === "string" ? body.date : "a new time"}.`,
      href: "/(tabs)/bookings",
      data: { type: "booking_rescheduled", bookingId: id },
    })

    return jsonOk({ rescheduled: true })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/bookings/:id/reschedule]", error)
    return jsonError(500, "Could not reschedule booking.")
  }
}
