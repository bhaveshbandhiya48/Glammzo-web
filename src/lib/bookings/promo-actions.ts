"use server"

import { getSession } from "@/lib/auth/session"
import { getGlammzoOfferCashbackEligibility } from "@/lib/marketing/glammzo-offers"
import { getSalonOfferEligibility } from "@/lib/bookings/salon-offer-eligibility"
import { getSalonById } from "@/lib/salons"
import { validatePromoCode } from "@/lib/bookings/validate-promo-code"

export async function validatePromoCodeAction(input: {
  salonId: string
  code: string
  serviceIds: string[]
  packageId?: string | null
}) {
  const session = await getSession()
  return validatePromoCode({
    ...input,
    phone: session?.phone,
  })
}

function newCustomerSignInMessage(code: string) {
  return `Sign in to apply ${code || "this offer"}. It's for first-time customers only at this salon.`
}

/** Customer eligibility for Available Savings (new-customer, already used, sign-in). */
export async function getCartOfferEligibilityAction(input: {
  salonId: string
  items: Array<{
    id: string
    code: string
    kind: "salon" | "glammzo"
    customerEligibility?: "all_customers" | "new_customers_only"
    glammzoOfferId?: string
  }>
}): Promise<Record<string, string>> {
  const blocked: Record<string, string> = {}
  if (input.items.length === 0) return blocked

  const session = await getSession()
  const phone = session?.phone ?? null

  if (!phone) {
    for (const item of input.items) {
      if (item.kind === "salon" && item.customerEligibility === "new_customers_only") {
        blocked[item.id] = newCustomerSignInMessage(item.code)
      }
    }
    return blocked
  }

  const salon = await getSalonById(input.salonId)
  const crmSalonId = salon?.crmSalonId
  if (!crmSalonId) return blocked

  await Promise.all(
    input.items.map(async (item) => {
      if (item.kind === "glammzo") {
        if (!item.glammzoOfferId || !item.code) return
        const eligibility = await getGlammzoOfferCashbackEligibility({
          phone,
          offerId: item.glammzoOfferId,
          code: item.code,
        })
        if (!eligibility.ok) blocked[item.id] = eligibility.message
        return
      }

      const eligibility = await getSalonOfferEligibility({
        phone,
        offerId: item.id,
        code: item.code,
        salonId: crmSalonId,
        customerEligibility: item.customerEligibility ?? "all_customers",
      })
      if (!eligibility.ok) blocked[item.id] = eligibility.message
    }),
  )

  return blocked
}
