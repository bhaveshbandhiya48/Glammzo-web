export function buildFullAddress(parts: {
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
}) {
  return [
    parts.addressLine1,
    parts.addressLine2,
    parts.city,
    parts.state,
    parts.postalCode,
    parts.country,
  ]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ")
}
