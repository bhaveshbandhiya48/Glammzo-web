import type { Metadata } from "next"

import { LandingPage } from "@/components/sections/landing-page"
import { SEO_HOME, SITE_URL } from "@/lib/seo/site-seo"

/**
 * Explicit marketing homepage (not redirected on mobile).
 * Root `/` still redirects phones to `/explore`; use `/home` when the full
 * landing story is needed on any device.
 */
export const metadata: Metadata = {
  title: {
    absolute: SEO_HOME.title,
  },
  description: SEO_HOME.description,
  keywords: [...SEO_HOME.keywords],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: SEO_HOME.title,
    description: SEO_HOME.description,
    url: SITE_URL,
    siteName: "Glammzo",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_HOME.title,
    description: SEO_HOME.description,
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function MarketingHomePage() {
  return <LandingPage />
}
