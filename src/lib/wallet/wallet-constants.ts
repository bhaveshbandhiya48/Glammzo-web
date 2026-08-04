/** Shared client-safe wallet / loyalty constants (no server-only imports). */

export const FIRST_200_CAMPAIGN_CODE = "first_200_cashback"
/** Welcome cashback amount (₹200). */
export const CASHBACK_REWARD_PAISE = 20000
/** First completed booking must be at least this to earn cashback (₹699). */
export const CASHBACK_MIN_ORDER_PAISE = 69900
/** Loyalty reward after every 10 visits: up to ₹999 off one service. */
export const LOYALTY_DISCOUNT_CAP_PAISE = 99900
/** @deprecated Use LOYALTY_DISCOUNT_CAP_PAISE */
export const FREE_SERVICE_CAP_PAISE = LOYALTY_DISCOUNT_CAP_PAISE
export const LOYALTY_VISITS_PER_FREE = 10
