import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"

/** Display a stored E.164 phone as a 10-digit Indian mobile for form inputs. */
export function formatPhoneForInput(phone: string): string {
  const digits = normalizeCustomerPhoneDigits(phone)

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2)
  }

  return digits
}
