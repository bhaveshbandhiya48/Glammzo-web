import {
  SEO_HOME,
  SEO_ORGANIZATION,
  SEO_SALONS_NEAR_ME,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site-seo"

export function jsonLdScript(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  }
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_ORGANIZATION.name,
    legalName: SEO_ORGANIZATION.legalName,
    url: SEO_ORGANIZATION.url,
    logo: SEO_ORGANIZATION.logo,
    email: SEO_ORGANIZATION.email,
    sameAs: SEO_ORGANIZATION.sameAs,
    areaServed: {
      "@type": "City",
      name: "Bengaluru",
      alternateName: "Bangalore",
    },
  }
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SEO_HOME.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

/** Marketplace / online service schema for salon discovery. */
export function buildSalonBookingServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Online salon booking near you",
    serviceType: "Salon and beauty appointment booking",
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      "@type": "City",
      name: "Bengaluru",
      alternateName: "Bangalore",
    },
    description: SEO_SALONS_NEAR_ME.description,
    url: `${SITE_URL}${SEO_SALONS_NEAR_ME.path}`,
  }
}

export function buildFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export const SALON_NEAR_ME_FAQS = [
  {
    question: "How do I find a salon near me on Glammzo?",
    answer:
      "Open Explore or Salons near me, allow location or pick your city, then browse verified salons nearby. Compare services, fixed prices, and available slots, and book online in minutes.",
  },
  {
    question: "Can I book a salon nearby me online?",
    answer:
      "Yes. Glammzo lets you discover salons near you, see fixed prices upfront, choose a time, and confirm your appointment without calling the salon.",
  },
  {
    question: "Which cities have salons near me on Glammzo?",
    answer:
      "Glammzo is live with salon partners in Bengaluru (Bangalore), with more cities coming soon. Use Explore to see salons available near your selected location.",
  },
  {
    question: "Is there a launch offer when I book my first salon service?",
    answer:
      "Yes. Use the launch promo code shown on Glammzo when you book. After your first completed visit, ₹200 cashback is added to your Glammzo wallet.",
  },
] as const
