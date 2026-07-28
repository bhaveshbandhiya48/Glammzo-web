/** Canonical glamzzo-crm origin for partner onboarding links. */
export function getGlamzzoCrmUrl(): string {
  if (process.env.NEXT_PUBLIC_GLAMZZO_CRM_URL) {
    return process.env.NEXT_PUBLIC_GLAMZZO_CRM_URL.replace(/\/$/, "")
  }

  // glamzzo-crm `npm run dev` uses port 4005
  return "http://localhost:4005"
}

export function buildCrmSignupUrl(email?: string): string {
  const base = `${getGlamzzoCrmUrl()}/signup`
  if (!email?.trim()) return base

  const sp = new URLSearchParams()
  sp.set("email", email.trim().toLowerCase())
  return `${base}?${sp.toString()}`
}

/** Post-provision destination inside CRM — complete business profile first. */
export function buildCrmOnboardingDestination(options?: {
  salonId?: string
  nextPath?: string
}): string {
  const base = getGlamzzoCrmUrl()
  const nextPath = options?.nextPath?.startsWith("/")
    ? options.nextPath
    : "/setup/profile"
  return `${base}/auth/callback?next=${encodeURIComponent(nextPath)}`
}

export function buildCrmDashboardUrl(): string {
  return `${getGlamzzoCrmUrl()}/dashboard`
}
