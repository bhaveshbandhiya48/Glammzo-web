import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import {
  createMobileBooking,
  listMobileCustomerBookings,
} from "@/lib/bookings/mobile-bookings"
import { queueCustomerPush } from "@/lib/push/send-customer-push"

export async function GET(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) return jsonError(401, "Sign in required.")
    const bookings = await listMobileCustomerBookings(session.phone)
    return jsonOk({ bookings })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/bookings GET]", error)
    return jsonError(500, "Could not load bookings.")
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) return jsonError(401, "Sign in required.")

    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      return jsonError(400, "Invalid JSON body.")
    }

    const serviceIds = Array.isArray(body.serviceIds)
      ? body.serviceIds.filter((id): id is string => typeof id === "string")
      : typeof body.serviceIds === "string"
        ? body.serviceIds.split(",").map((s) => s.trim()).filter(Boolean)
        : []

    const result = await createMobileBooking({
      salonId: typeof body.salonId === "string" ? body.salonId : "",
      serviceIds,
      date: typeof body.date === "string" ? body.date : "",
      time: typeof body.time === "string" ? body.time : "",
      notes: typeof body.notes === "string" ? body.notes : undefined,
      customerName:
        typeof body.customerName === "string"
          ? body.customerName
          : session.name || "",
      customerEmail:
        typeof body.customerEmail === "string"
          ? body.customerEmail
          : session.email || "",
      customerPhone:
        typeof body.customerPhone === "string"
          ? body.customerPhone
          : session.phone,
      preferredStaffId:
        typeof body.preferredStaffId === "string"
          ? body.preferredStaffId
          : undefined,
      packageId: typeof body.packageId === "string" ? body.packageId : undefined,
      promoCode: typeof body.promoCode === "string" ? body.promoCode : undefined,
      marketingOptIn:
        typeof body.marketingOptIn === "boolean" ? body.marketingOptIn : true,
      useWallet: Boolean(body.useWallet),
      useFreeService: Boolean(body.useFreeService),
    })

    if (!result.ok) {
      return jsonError(400, result.error, { code: result.code })
    }

    const booking = result.booking
    if (booking.status === "confirmed") {
      queueCustomerPush(session.phone, {
        title: "Booking confirmed",
        body: `${booking.salonName} confirmed your appointment for ${booking.date} at ${booking.time}.`,
        href: "/(tabs)/bookings",
        data: { type: "booking_confirmed", bookingId: booking.id },
      })
    } else {
      queueCustomerPush(session.phone, {
        title: "Awaiting salon confirmation",
        body: `We sent your request to ${booking.salonName}. You'll be notified once they confirm.`,
        href: "/(tabs)/bookings",
        data: { type: "booking_pending", bookingId: booking.id },
      })
    }

    return jsonOk({ booking }, 201)
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/bookings POST]", error)
    return jsonError(500, "Could not create booking.")
  }
}
