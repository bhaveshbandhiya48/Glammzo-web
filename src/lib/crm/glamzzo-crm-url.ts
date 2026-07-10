/** Canonical glamzzo-crm origin for partner onboarding links. */
export function getGlamzzoCrmUrl(): string {
  if (process.env.NEXT_PUBLIC_GLAMZZO_CRM_URL) {
    return process.env.NEXT_PUBLIC_GLAMZZO_CRM_URL.replace(/\/$/, "")
  }

  return "http://localhost:3001"
}

export function buildCrmSignupUrl(email?: string): string {
  const base = `${getGlamzzoCrmUrl()}/signup`
  if (!email?.trim()) return base

  const sp = new URLSearchParams()
  sp.set("email", email.trim().toLowerCase())
  return `${base}?${sp.toString()}`
}
