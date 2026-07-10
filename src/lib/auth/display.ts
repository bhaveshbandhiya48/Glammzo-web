const PLACEHOLDER_NAMES = new Set(["guest", ""])

export function resolveSessionDisplayName(name?: string | null) {
  const trimmed = name?.trim() ?? ""

  if (!trimmed || PLACEHOLDER_NAMES.has(trimmed.toLowerCase())) {
    return ""
  }

  return trimmed
}

export function resolveSessionDisplayEmail(email?: string | null) {
  return email?.trim() ?? ""
}

export function resolveSessionGreeting(input: {
  name?: string | null
  phone?: string | null
}) {
  return (
    resolveSessionDisplayName(input.name) ||
    input.phone?.trim() ||
    "there"
  )
}
