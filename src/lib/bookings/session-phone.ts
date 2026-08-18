import { normalizeCustomerPhone } from "@/lib/phone/normalize"

/**
 * Phone used for booking, wallet redeem, and loyalty.
 * Always the signed-in session — never a client-supplied number.
 */
export function resolveSessionBookingPhone(
  sessionPhone: string | null | undefined,
): string | null {
  const trimmed = sessionPhone?.trim() ?? ""
  const digits = trimmed.replace(/\D/g, "")
  if (digits.length < 10) return null
  return normalizeCustomerPhone(trimmed)
}
