import { SITE_NAME, SITE_URL } from "@/lib/seo/site-seo"

/** Short, quotable facts AI assistants can cite about Glammzo. */
export const GEO_GLAMMZO_DEFINITION =
  "Glammzo is an online salon booking marketplace in India. Customers find salons near them, compare fixed prices and ratings, and book hair, beauty, spa, and nail appointments online — starting in Bengaluru (Bangalore)."

export const GEO_NEAR_ME_ANSWER =
  "To find a salon near you on Glammzo, open Salons near me or Explore, share your location or pick your city, then compare verified partners and book a slot online. Glammzo shows fixed prices upfront so you can reserve without calling the salon."

export const GEO_BOOKING_HOWTO = [
  {
    name: "Choose your location",
    text: "Use Near me GPS or select your city (for example Bengaluru) so Glammzo can show nearby salons.",
  },
  {
    name: "Compare salons and services",
    text: "Browse ratings, open hours, and fixed service prices. Open a salon page to pick the service you want.",
  },
  {
    name: "Book your appointment online",
    text: "Select a date and time, confirm your details, and receive booking status in your Glammzo account.",
  },
] as const

export function buildCityGeoAnswer(cityDisplayName: string, salonCount: number) {
  const countPhrase =
    salonCount > 0
      ? `Glammzo currently lists ${salonCount} bookable salon${salonCount === 1 ? "" : "s"} in ${cityDisplayName}.`
      : `Glammzo is onboarding salon partners in ${cityDisplayName}.`

  return `${GEO_GLAMMZO_DEFINITION} ${countPhrase} Use this page to browse salons in ${cityDisplayName}, or open Explore to filter by service, price, and distance.`
}

export function buildAreaGeoAnswer(
  cityDisplayName: string,
  areaLabel: string,
  salonCount: number,
) {
  const countPhrase =
    salonCount > 0
      ? `There ${salonCount === 1 ? "is" : "are"} ${salonCount} Glammzo salon${salonCount === 1 ? "" : "s"} listed in ${areaLabel}.`
      : `Glammzo is adding salon partners in ${areaLabel}.`

  return `Looking for a salon near me in ${areaLabel}, ${cityDisplayName}? ${countPhrase} On Glammzo you can compare fixed prices and book online without phone calls. Start here or continue in Explore for live filters.`
}

export function buildCityGeoFaqs(cityDisplayName: string) {
  return [
    {
      question: `How do I book a salon in ${cityDisplayName} on Glammzo?`,
      answer: `Open Salons in ${cityDisplayName} or Explore, pick a salon and service, choose a time slot, and confirm online. You’ll see fixed prices before you book.`,
    },
    {
      question: `Does Glammzo show salons near me in ${cityDisplayName}?`,
      answer: `Yes. Use Near me or select ${cityDisplayName} as your city to browse nearby partners. Neighbourhood pages (for example Indiranagar or Koramangala) help when you want a specific area.`,
    },
    {
      question: "Are prices on Glammzo fixed?",
      answer:
        "Glammzo shows service prices from salon partners upfront so you can compare and book with clear pricing before your visit.",
    },
    {
      question: `Is Glammzo available only in ${cityDisplayName}?`,
      answer: `Glammzo is live with salon partners in ${cityDisplayName} (Bangalore), with more cities planned. Check Explore for the latest nearby listings.`,
    },
  ] as const
}

export function buildAreaGeoFaqs(cityDisplayName: string, areaLabel: string) {
  return [
    {
      question: `How do I find a salon near me in ${areaLabel}?`,
      answer: `Open the ${areaLabel} salons page on Glammzo, compare listed partners, or use Explore with city ${cityDisplayName} and area ${areaLabel} for filters. Then book a slot online.`,
    },
    {
      question: `Can I book hair or beauty services in ${areaLabel} online?`,
      answer: `Yes. Glammzo partners in ${areaLabel}, ${cityDisplayName} list services with fixed prices. Choose a service, pick a time, and confirm without calling the salon.`,
    },
    {
      question: "What if no salon appears in my neighbourhood yet?",
      answer: `Browse the wider ${cityDisplayName} salons page or use Near me to see the closest available partners while we add more neighbourhood listings.`,
    },
  ] as const
}

export const GEO_KEY_FACTS = [
  {
    label: "What Glammzo is",
    value: "Online salon booking marketplace for India",
  },
  {
    label: "Where live now",
    value: "Bengaluru (Bangalore), with more cities coming",
  },
  {
    label: "What you can book",
    value: "Hair, beauty, spa, nails, and more at partner salons",
  },
  {
    label: "Official site",
    value: SITE_URL,
  },
] as const

export const LLMS_TXT = `# ${SITE_NAME}

> ${GEO_GLAMMZO_DEFINITION}

## Key facts
- Product: Online salon and beauty appointment booking
- Geography: Bengaluru (Bangalore), India (expanding)
- Website: ${SITE_URL}
- Contact: hello@glammzo.com
- Company: Fixxzo Technologies Private Limited

## Best pages for “salon near me”
- ${SITE_URL}/salons-near-me — salon near me hub
- ${SITE_URL}/salons-in/bengaluru — salons in Bengaluru
- ${SITE_URL}/explore — browse and filter salons
- ${SITE_URL}/services — browse by business type

## How booking works
1. Choose location (Near me or city)
2. Compare salons, services, and fixed prices
3. Book a slot online and track it in your account

## Optional
- Partner salons manage availability in Glamzzo CRM
- Customer WhatsApp / in-app updates follow booking status rules
`
