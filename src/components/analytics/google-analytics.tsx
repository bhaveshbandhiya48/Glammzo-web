import { GoogleAnalytics } from "@next/third-parties/google"

/** GA4 measurement ID. Prefer env so staging can disable or use a different property. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || ""

/**
 * Loads Google Analytics 4 sitewide when a measurement ID is configured.
 * Place inside the root layout `<html>` (sibling of `<body>` is fine).
 */
export function Analytics() {
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
}
