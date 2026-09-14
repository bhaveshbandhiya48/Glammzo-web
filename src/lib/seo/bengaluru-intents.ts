import { businessTypeSlugFromLabel } from "@/lib/categories/business-types"
import { filterSalonsByCity } from "@/lib/salons/city-filter"
import { SITE_URL } from "@/lib/seo/site-seo"
import type { Salon } from "@/types/salon"

export const BENGALURU_SEO_CITY = "Bengaluru"
export const BENGALURU_SEO_CITY_SLUG = "bengaluru"

/** High-intent Bengaluru queries we publish as crawlable landing pages. */
export const BENGALURU_SEO_INTENTS = [
  {
    slug: "hair-salon-in-bengaluru",
    h1: "Hair salons in Bengaluru",
    title: "Hair Salon in Bengaluru (Bangalore) | Book Cuts & Colour Online",
    description:
      "Find a hair salon in Bengaluru and book online. Compare haircuts, colour, keratin, and styling at verified salons in Indiranagar, Koramangala, HSR, Whitefield, and more. Fixed prices, live slots.",
    keywords: [
      "hair salon in bengaluru",
      "hair salon in bangalore",
      "haircut in bengaluru",
      "hair colour bangalore",
      "best hair salon in bangalore",
    ],
    exploreQuery: "hair",
    businessTypeSlugs: ["salon", "unisex-salon"],
    serviceKeywords: ["hair", "cut", "colour", "color", "keratin", "smoothening", "highlight"],
    answer:
      "Glammzo lists hair salons across Bengaluru (Bangalore) so you can compare cuts, colour, and styling with fixed prices, then book a slot online without calling the salon.",
    faqs: [
      {
        question: "How do I book a haircut in Bengaluru on Glammzo?",
        answer:
          "Open Hair salon in Bengaluru, pick a salon, choose a cut or colour service, select a time, and confirm online. Prices are shown before you book.",
      },
      {
        question: "Which areas have hair salons on Glammzo?",
        answer:
          "Partners are listed across Indiranagar, Koramangala, HSR Layout, Whitefield, Jayanagar, MG Road, and more. Use Explore to filter by neighbourhood.",
      },
    ],
  },
  {
    slug: "spa-in-bengaluru",
    h1: "Spas in Bengaluru",
    title: "Spa in Bengaluru (Bangalore) | Book Massage & Body Rituals Online",
    description:
      "Book a spa in Bengaluru. Compare massage, body rituals, and wellness sessions at verified spa partners. See fixed prices and available times, then confirm online on Glammzo.",
    keywords: [
      "spa in bengaluru",
      "spa in bangalore",
      "massage in bengaluru",
      "best spa in bangalore",
      "spa near me bangalore",
    ],
    exploreQuery: "spa",
    businessTypeSlugs: ["spa"],
    serviceKeywords: ["spa", "massage", "body", "aromatherapy", "relax"],
    answer:
      "Looking for a spa in Bengaluru? Glammzo shows verified spa partners with massage and body rituals, fixed prices, and online booking across Bangalore neighbourhoods.",
    faqs: [
      {
        question: "Can I book a spa in Bangalore online?",
        answer:
          "Yes. Choose a spa on this page or Explore, pick a massage or body ritual, select a slot, and confirm on Glammzo without a phone call.",
      },
      {
        question: "Are spa prices on Glammzo fixed?",
        answer:
          "Glammzo shows partner prices upfront so you can compare spas in Bengaluru before you book.",
      },
    ],
  },
  {
    slug: "nail-salon-in-bengaluru",
    h1: "Nail salons in Bengaluru",
    title: "Nail Salon in Bengaluru (Bangalore) | Book Mani, Pedi & Gel Online",
    description:
      "Find a nail salon in Bengaluru. Compare manicures, pedicures, gel, and nail art at verified studios. Book online with fixed prices on Glammzo.",
    keywords: [
      "nail salon in bengaluru",
      "nail salon in bangalore",
      "manicure bangalore",
      "pedicure bengaluru",
      "gel nails bangalore",
    ],
    exploreQuery: "nail",
    businessTypeSlugs: ["nail-art-studio"],
    serviceKeywords: ["nail", "mani", "pedi", "gel", "acrylic"],
    answer:
      "Glammzo lists nail salons and nail art studios in Bengaluru so you can compare manicures, pedicures, and gel work, then book a time online.",
    faqs: [
      {
        question: "Where can I book gel nails in Bengaluru?",
        answer:
          "Browse nail salons on this page, open a studio, choose gel or nail art, and confirm a slot on Glammzo.",
      },
      {
        question: "Do nail studios on Glammzo show prices?",
        answer:
          "Yes. Partner nail salons in Bangalore list service prices before you book.",
      },
    ],
  },
  {
    slug: "beauty-parlour-in-bengaluru",
    h1: "Beauty parlours in Bengaluru",
    title: "Beauty Parlour in Bengaluru (Bangalore) | Facials, Waxing & More",
    description:
      "Book a beauty parlour in Bengaluru. Compare facials, threading, waxing, and classic parlour treatments with fixed prices and online slots on Glammzo.",
    keywords: [
      "beauty parlour in bengaluru",
      "beauty parlour in bangalore",
      "facial in bengaluru",
      "waxing bangalore",
      "threading near me bangalore",
    ],
    exploreQuery: "facial",
    businessTypeSlugs: ["beauty-parlour"],
    serviceKeywords: ["facial", "wax", "thread", "cleanup", "bleach", "parlour"],
    answer:
      "Glammzo helps you find beauty parlours in Bengaluru (Bangalore) for facials, waxing, and threading, with upfront prices and online booking.",
    faqs: [
      {
        question: "How do I book a facial in Bangalore?",
        answer:
          "Open Beauty parlour in Bengaluru, pick a parlour, choose a facial or cleanup, and confirm your time on Glammzo.",
      },
      {
        question: "Are beauty parlours in Bengaluru verified on Glammzo?",
        answer:
          "Listings are published partner businesses. You can compare ratings, prices, and locations before you book.",
      },
    ],
  },
  {
    slug: "unisex-salon-in-bengaluru",
    h1: "Unisex salons in Bengaluru",
    title: "Unisex Salon in Bengaluru (Bangalore) | Book Men & Women Online",
    description:
      "Find a unisex salon in Bengaluru. Book hair, grooming, and beauty services for men and women with fixed prices and live slots on Glammzo.",
    keywords: [
      "unisex salon in bengaluru",
      "unisex salon in bangalore",
      "mens salon bengaluru",
      "gents salon bangalore",
      "salon for men and women bangalore",
    ],
    exploreQuery: "unisex",
    businessTypeSlugs: ["unisex-salon"],
    serviceKeywords: ["unisex", "grooming", "beard", "men", "gents"],
    answer:
      "Unisex salons in Bengaluru on Glammzo serve men and women. Compare grooming and hair services, see prices, and book online.",
    faqs: [
      {
        question: "Can men and women book the same salon in Bengaluru?",
        answer:
          "Yes. Unisex salon partners list services for both. Filter Explore by unisex salon or open a listing to see the menu.",
      },
      {
        question: "How do I find a gents salon in Bangalore?",
        answer:
          "Start with Unisex salon in Bengaluru or Explore, then open a partner menu for men’s hair and grooming services.",
      },
    ],
  },
  {
    slug: "best-salons-in-bengaluru",
    h1: "Best salons in Bengaluru",
    title: "Best Salons in Bengaluru (Bangalore) | Top Rated, Book Online",
    description:
      "See top-rated salons in Bengaluru. Compare ratings, fixed prices, and neighbourhoods like Indiranagar, Koramangala, HSR, and Whitefield, then book online on Glammzo.",
    keywords: [
      "best salons in bengaluru",
      "best salons in bangalore",
      "top salons bangalore",
      "best hair salon bengaluru",
      "best spa bangalore",
    ],
    exploreQuery: "",
    businessTypeSlugs: [],
    serviceKeywords: [],
    matchAllInCity: true,
    sortByRating: true,
    answer:
      "Glammzo ranks Bengaluru salon partners by ratings and reviews so you can compare the best-listed salons, see fixed prices, and book a slot online.",
    faqs: [
      {
        question: "How does Glammzo pick the best salons in Bengaluru?",
        answer:
          "This page highlights published partners with the strongest ratings and review counts. Always compare services and prices for your neighbourhood.",
      },
      {
        question: "Are the best salons in Bangalore available to book online?",
        answer:
          "Yes. Open a listing, choose a service and time, and confirm on Glammzo.",
      },
    ],
  },
] as const

export type BengaluruSeoIntent = (typeof BENGALURU_SEO_INTENTS)[number]

export function resolveBengaluruSeoIntent(slug: string): BengaluruSeoIntent | null {
  const normalized = slug.trim().toLowerCase()
  return BENGALURU_SEO_INTENTS.find((intent) => intent.slug === normalized) ?? null
}

export function buildBengaluruIntentPath(slug: string): string {
  return `/${encodeURIComponent(slug)}`
}

export function buildBengaluruIntentUrl(slug: string): string {
  return `${SITE_URL}${buildBengaluruIntentPath(slug)}`
}

export function buildBengaluruIntentExploreHref(intent: BengaluruSeoIntent): string {
  const params = new URLSearchParams({ city: BENGALURU_SEO_CITY })
  if (intent.exploreQuery) params.set("q", intent.exploreQuery)
  return `/explore?${params.toString()}`
}

function salonSearchText(salon: Salon): string {
  const services = (salon.services ?? [])
    .map((service) => `${service.name} ${service.category}`)
    .join(" ")
  return `${salon.name} ${salon.businessType ?? ""} ${salon.description ?? ""} ${salon.shortDescription ?? ""} ${services}`.toLowerCase()
}

export function salonMatchesBengaluruIntent(salon: Salon, intent: BengaluruSeoIntent): boolean {
  if ("matchAllInCity" in intent && intent.matchAllInCity) return true

  const typeSlug = businessTypeSlugFromLabel(salon.businessType)
  if (intent.businessTypeSlugs.length > 0 && typeSlug && intent.businessTypeSlugs.includes(typeSlug)) {
    return true
  }

  const haystack = salonSearchText(salon)
  return intent.serviceKeywords.some((keyword) => haystack.includes(keyword))
}

export function filterSalonsByBengaluruIntent(salons: Salon[], intent: BengaluruSeoIntent): Salon[] {
  const inCity = filterSalonsByCity(salons, BENGALURU_SEO_CITY)
  const matched = inCity.filter((salon) => salonMatchesBengaluruIntent(salon, intent))
  if (!("sortByRating" in intent) || !intent.sortByRating) return matched

  return [...matched].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating
    return (b.reviews ?? 0) - (a.reviews ?? 0)
  })
}
