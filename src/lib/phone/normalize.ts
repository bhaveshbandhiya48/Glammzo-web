const DEFAULT_COUNTRY_CODE = "91"

export function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, "")
}

/** Canonical digits-only phone key used for uniqueness and lookup. */
export function normalizeCustomerPhoneDigits(
  value: string,
  countryCode: string = DEFAULT_COUNTRY_CODE,
) {
  const digits = normalizePhoneDigits(value)

  if (!digits) {
    return ""
  }

  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `${countryCode}${digits}`
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    const local = digits.slice(1)

    if (local.length === 10 && /^[6-9]/.test(local)) {
      return `${countryCode}${local}`
    }
  }

  if (digits.length === 12 && digits.startsWith(countryCode)) {
    return digits
  }

  if (digits.length > 10 && digits.startsWith(countryCode)) {
    return digits
  }

  if (digits.length === 10) {
    return `${countryCode}${digits}`
  }

  return digits
}

/** Canonical E.164-style storage value (+919876543210). */
export function normalizeCustomerPhone(
  value: string,
  countryCode: string = DEFAULT_COUNTRY_CODE,
) {
  const normalizedDigits = normalizeCustomerPhoneDigits(value, countryCode)

  if (!normalizedDigits) {
    return value.trim()
  }

  return `+${normalizedDigits}`
}
