export const ONBOARDING_COOKIE = "glamzzo_salon_onboarding"
export const ONBOARDING_OTP_COOKIE = "glamzzo_salon_onboarding_otp"
export const ONBOARDING_COOKIE_TTL_SECONDS = 60 * 15 // 15m like CRM pending signup
export const ONBOARDING_OTP_TTL_SECONDS = 60 * 10

/** Same options as glamzzo-crm salon signup. */
export const BUSINESS_TYPES = [
  "Salon",
  "Unisex Salon",
  "Beauty Parlour",
  "Spa",
  "Barber Shop",
  "Yoga Center",
] as const

export type BusinessType = (typeof BUSINESS_TYPES)[number]

export type OnboardingStep = "details" | "otp" | "done"

/** Mirrors glamzzo-crm PendingSalonSignup. */
export type SalonOnboardingProgress = {
  step: OnboardingStep
  businessName: string
  ownerName: string
  mobile: string
  city: string
  businessType: BusinessType
  createdAt: number
  updatedAt: number
  salonId?: string
}

export type OnboardingActionState = {
  ok: boolean
  message?: string
  step?: OnboardingStep
  fieldErrors?: Partial<Record<string, string>>
  debugOtp?: string
  maskedMobile?: string
  crmHandoffUrl?: string
  welcomePath?: string
}

export function buildPhoneSignupEmail(mobile: string) {
  const digits = mobile.replace(/\D/g, "").slice(-10)
  return `${digits}@phone.glamzzo.local`
}

export function maskIndianMobile(mobile: string) {
  const digits = mobile.replace(/\D/g, "").slice(-10)
  if (digits.length < 4) return mobile
  return `+91 ${digits.slice(0, 2)}****${digits.slice(-4)}`
}
