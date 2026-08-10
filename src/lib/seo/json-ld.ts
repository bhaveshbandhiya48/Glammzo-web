import {
  SEO_HOME,
  SEO_ORGANIZATION,
  SEO_SALONS_NEAR_ME,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site-seo"
import { GEO_BOOKING_HOWTO, GEO_GLAMMZO_DEFINITION } from "@/lib/seo/geo-copy"

export function jsonLdScript(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  }
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SEO_ORGANIZATION.name,
    legalName: SEO_ORGANIZATION.legalName,
    url: SEO_ORGANIZATION.url,
    logo: {
      "@type": "ImageObject",
      url: SEO_ORGANIZATION.logo,
    },
    email: SEO_ORGANIZATION.email,
    description: GEO_GLAMMZO_DEFINITION,
    sameAs: SEO_ORGANIZATION.sameAs,
    areaServed: {
      "@type": "City",
      name: "Bengaluru",
      alternateName: "Bangalore",
      containedInPlace: {
        "@type": "Country",
        name: "India",
      },
    },
    knowsAbout: [
      "salon booking",
      "salon near me",
      "beauty salon appointments",
      "spa booking",
      "Bengaluru salons",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SEO_ORGANIZATION.email,
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  }
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SEO_HOME.description,
    publisher: { "@id": `${SITE_URL}/#organization` },
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
    "@id": `${SITE_URL}${SEO_SALONS_NEAR_ME.path}#service`,
    name: "Online salon booking near you",
    serviceType: "Salon and beauty appointment booking",
    provider: { "@id": `${SITE_URL}/#organization` },
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

export function buildHowToBookJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to book a salon near you on Glammzo",
    description: GEO_GLAMMZO_DEFINITION,
    totalTime: "PT5M",
    step: GEO_BOOKING_HOWTO.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${SITE_URL}/salons-near-me#how-to-book`,
    })),
  }
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path?: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path
        ? {
            item: item.path.startsWith("http")
              ? item.path
              : `${SITE_URL}${item.path}`,
          }
        : {}),
    })),
  }
}

export const SALON_NEAR_ME_FAQS = [
  {
    question: "How do I find a salon near me on Glammzo?",
    answer:
      "Open Explore or Salons near me, allow location or pick your city, then browse verified salons nearby. You can also start from Salons in Bengaluru neighbourhood pages, compare services and fixed prices, and book online in minutes.",
  },
  {
    question: "Can I book a salon nearby me online?",
    answer:
      "Yes. Glammzo lets you discover salons near you, see fixed prices upfront, choose a time, and confirm your appointment without calling the salon.",
  },
  {
    question: "Which cities have salons near me on Glammzo?",
    answer:
      "Glammzo is live with salon partners in Bengaluru (Bangalore), with more cities coming soon. Browse Salons in Bengaluru or use Explore to see salons near your selected location.",
  },
  {
    question: "What is Glammzo?",
    answer: GEO_GLAMMZO_DEFINITION,
  },
  {
    question: "Is there a launch offer when I book my first salon service?",
    answer:
      "Yes. Use the launch promo code shown on Glammzo when you book. After your first completed visit, ₹200 cashback is added to your Glammzo wallet.",
  },
] as const
