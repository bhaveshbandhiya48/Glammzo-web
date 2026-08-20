"use client"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

const META_STANDARD_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "Search",
  "AddToCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Lead",
  "CompleteRegistration",
  "Contact",
  "Schedule",
  "Subscribe",
])

/**
 * Fire GA4 and Meta Pixel events when those scripts are loaded.
 * Safe no-op on SSR or when IDs are unset / blocked.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === "undefined") {
    return
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params)
  }

  if (typeof window.fbq === "function") {
    if (META_STANDARD_EVENTS.has(eventName)) {
      window.fbq("track", eventName, params)
    } else {
      window.fbq("trackCustom", eventName, params)
    }
  }
}
