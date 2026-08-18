/** Client-safe launch offer (₹200 wallet cashback — not an instant booking discount). */

import { CASHBACK_MIN_ORDER_PAISE } from "@/lib/wallet/wallet-constants"

export const LAUNCH_PROMO_CODE = (
  process.env.NEXT_PUBLIC_LAUNCH_PROMO_CODE?.trim() || "WLCM200"
).toUpperCase()

/** Cashback amount shown in marketing (₹200). */
export const LAUNCH_CASHBACK_RUPEES = 200

/** Minimum booking total (₹) required to claim launch cashback. */
export const LAUNCH_CASHBACK_MIN_RUPEES = CASHBACK_MIN_ORDER_PAISE / 100

/** @deprecated Alias — use LAUNCH_CASHBACK_RUPEES. Kept so older imports keep typechecking. */
export const LAUNCH_PROMO_DISCOUNT_RUPEES = LAUNCH_CASHBACK_RUPEES

export const LAUNCH_PROMO_TITLE = "Launch offer — ₹200 cashback"

/**
 * Hardcoded WLCM200 launch/welcome offer is retired — use CMS Glammzo offers.
 * Set NEXT_PUBLIC_LAUNCH_PROMO_ACTIVE=true only to re-enable temporarily.
 */
export const LAUNCH_PROMO_ACTIVE = process.env.NEXT_PUBLIC_LAUNCH_PROMO_ACTIVE === "true"

export function isLaunchPromoCode(code: string) {
  return code.trim().toUpperCase() === LAUNCH_PROMO_CODE
}
