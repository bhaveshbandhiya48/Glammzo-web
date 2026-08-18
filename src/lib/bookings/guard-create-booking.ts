import "server-only"

import {
  BOOKING_RATE_LIMIT_MESSAGE,
  enforceAuthRateLimit,
} from "@/lib/auth/rate-limit"
import { resolveSessionBookingPhone } from "@/lib/bookings/session-phone"

export type GuardCreateBookingResult =
  | { ok: true; customerPhone: string }
  | { ok: false; code: "no_session_phone" | "rate_limit"; message: string }

/**
 * Bind create-booking to the signed-in phone and throttle floods.
 */
export async function guardCreateBooking(
  sessionPhone: string | null | undefined,
): Promise<GuardCreateBookingResult> {
  const customerPhone = resolveSessionBookingPhone(sessionPhone)
  if (!customerPhone) {
    return {
      ok: false,
      code: "no_session_phone",
      message: "Sign in with a valid mobile number to book.",
    }
  }

  const limited = await enforceAuthRateLimit("booking-create", customerPhone)
  if (limited) {
    return {
      ok: false,
      code: "rate_limit",
      message: limited,
    }
  }

  return { ok: true, customerPhone }
}

export { BOOKING_RATE_LIMIT_MESSAGE }
