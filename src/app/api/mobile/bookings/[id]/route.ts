import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import { getMobileCustomerBooking } from "@/lib/bookings/mobile-bookings"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Ctx) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) return jsonError(401, "Sign in required.")
    const { id } = await context.params
    const booking = await getMobileCustomerBooking(session.phone, id)
    if (!booking) return jsonError(404, "Booking not found.")
    return jsonOk({ booking })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/bookings/:id GET]", error)
    return jsonError(500, "Could not load booking.")
  }
}
