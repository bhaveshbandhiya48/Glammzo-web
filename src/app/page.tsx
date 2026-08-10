import type { Metadata } from "next"

import { LandingPage } from "@/components/sections/landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import {
  buildFaqJsonLd,
  buildHowToBookJsonLd,
  buildOrganizationJsonLd,
  buildSalonBookingServiceJsonLd,
  buildWebsiteJsonLd,
  SALON_NEAR_ME_FAQS,
} from "@/lib/seo/json-ld"
import { SEO_HOME, SITE_URL } from "@/lib/seo/site-seo"

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
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          buildOrganizationJsonLd(),
          buildWebsiteJsonLd(),
          buildSalonBookingServiceJsonLd(),
          buildHowToBookJsonLd(),
          buildFaqJsonLd([...SALON_NEAR_ME_FAQS]),
        ]}
      />
      <LandingPage />
    </>
  )
}
