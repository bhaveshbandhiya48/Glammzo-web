import { LOYALTY_DISCOUNT_CAP_PAISE } from "@/lib/wallet/wallet-constants"

export function computeWalletRedeemPaise(input: {
  payablePaise: number
  walletBalancePaise: number
  useWallet: boolean
  requestedPaise?: number | null
}) {
  if (!input.useWallet || input.payablePaise <= 0 || input.walletBalancePaise <= 0) {
    return 0
  }
  const requested =
    input.requestedPaise != null && input.requestedPaise > 0
      ? input.requestedPaise
      : input.walletBalancePaise
  return Math.min(input.payablePaise, input.walletBalancePaise, requested)
}

/**
 * Apply loyalty credit as up to ₹599 off one service line.
 * Prefer the highest-priced service; discount = min(price, ₹999).
 * If price ≤ ₹999 the line becomes free.
 */
export function pickLoyaltyDiscountLine<T extends { id: string; price: number }>(
  services: T[],
  useLoyaltyCredit: boolean,
): { service: T | null; discountRupees: number; discountPaise: number } {
  if (!useLoyaltyCredit || services.length === 0) {
    return { service: null, discountRupees: 0, discountPaise: 0 }
  }
  const chosen = [...services].sort((a, b) => b.price - a.price)[0] ?? null
  if (!chosen) return { service: null, discountRupees: 0, discountPaise: 0 }
  const discountPaise = Math.min(Math.round(chosen.price * 100), LOYALTY_DISCOUNT_CAP_PAISE)
  return {
    service: chosen,
    discountPaise,
    discountRupees: discountPaise / 100,
  }
}

/** @deprecated Use pickLoyaltyDiscountLine */
export function pickFreeServiceLine<T extends { id: string; price: number }>(
  services: T[],
  useFreeService: boolean,
) {
  const result = pickLoyaltyDiscountLine(services, useFreeService)
  return { service: result.service, valuePaise: result.discountPaise }
}
