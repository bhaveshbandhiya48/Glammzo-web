import { GoogleAnalytics } from "@next/third-parties/google"

import { MetaPixel } from "@/components/analytics/meta-pixel"

/** GA4 measurement ID. Prefer env so staging can disable or use a different property. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || ""

/**
 * Loads Google Analytics 4 and Meta Pixel when IDs are configured.
 */
export function Analytics() {
  return (
    <>
      {GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
      <MetaPixel />
    </>
  )
}
