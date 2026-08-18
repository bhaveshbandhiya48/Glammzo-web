"use server"

import { getSession } from "@/lib/auth/session"
import {
  validatePromoCode,
  type ValidatePromoCodeResult,
} from "@/lib/bookings/validate-promo-code"

export type { ValidatePromoCodeResult }

export async function validatePromoCodeAction(input: {
  salonId: string
  code: string
  serviceIds: string[]
  packageId?: string | null
}): Promise<ValidatePromoCodeResult> {
  const session = await getSession()
  return validatePromoCode({
    ...input,
    phone: session?.phone,
  })
}
