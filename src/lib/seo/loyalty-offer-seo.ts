import {
  LOYALTY_DISCOUNT_CAP_PAISE,
  LOYALTY_VISITS_PER_FREE,
} from "@/lib/wallet/wallet-constants"
import { SITE_URL } from "@/lib/seo/site-seo"

export const LOYALTY_OFFER_RUPEES = LOYALTY_DISCOUNT_CAP_PAISE / 100
export const LOYALTY_OFFER_VISITS = LOYALTY_VISITS_PER_FREE

export const SEO_LOYALTY_OFFER = {
  path: "/get-999-off",
  h1: `Get ₹${LOYALTY_OFFER_RUPEES} off — every ${LOYALTY_OFFER_VISITS}th salon service free`,
  title: `Get ₹${LOYALTY_OFFER_RUPEES} Off | Every ${LOYALTY_OFFER_VISITS}th Salon Service Free in Bengaluru`,
  description: `Get ₹${LOYALTY_OFFER_RUPEES} off or a free salon service after every ${LOYALTY_OFFER_VISITS} completed visits on Glammzo. Book hair, spa, nails, and beauty in Bengaluru with fixed prices.`,
  keywords: [
    `get ₹${LOYALTY_OFFER_RUPEES} off`,
    `${LOYALTY_OFFER_RUPEES} off salon`,
    `${LOYALTY_OFFER_RUPEES} off salon bangalore`,
    "every 10th service free",
    "every 10th salon service free",
    "free salon service bengaluru",
    "salon offer bangalore",
    "salon discount bengaluru",
    "loyalty salon offer india",
  ],
  headline: `Get ₹${LOYALTY_OFFER_RUPEES} off`,
  subhead: `Complete ${LOYALTY_OFFER_VISITS} visits, then your next service is free if it costs ₹${LOYALTY_OFFER_RUPEES} or less — otherwise get ₹${LOYALTY_OFFER_RUPEES} off.`,
} as const

export const LOYALTY_OFFER_FAQS = [
  {
    question: `How do I get ₹${LOYALTY_OFFER_RUPEES} off on Glammzo?`,
    answer: `Book and complete ${LOYALTY_OFFER_VISITS} salon visits on Glammzo. Your next booking unlocks a loyalty credit: the highest-priced service is free if it is ₹${LOYALTY_OFFER_RUPEES} or less, or you get ₹${LOYALTY_OFFER_RUPEES} off.`,
  },
  {
    question: "Is every 10th salon service free?",
    answer: `Yes, after every ${LOYALTY_OFFER_VISITS} completed visits. If that service costs more than ₹${LOYALTY_OFFER_RUPEES}, you still get ₹${LOYALTY_OFFER_RUPEES} off.`,
  },
  {
    question: `Does the ₹${LOYALTY_OFFER_RUPEES} off work in Bengaluru?`,
    answer: `Yes. The loyalty reward applies when you book partner salons on Glammzo, including hair, spa, nail, and beauty listings in Bengaluru (Bangalore).`,
  },
  {
    question: "Do I need a promo code for ₹999 off?",
    answer:
      "No code. Credits appear in your Glammzo account after completed visits. Apply the loyalty credit at checkout on your next booking.",
  },
] as const

export function buildLoyaltyOfferJsonLd() {
  const url = `${SITE_URL}${SEO_LOYALTY_OFFER.path}`
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    "@id": `${url}#offer`,
    name: SEO_LOYALTY_OFFER.h1,
    description: SEO_LOYALTY_OFFER.description,
    url,
    priceCurrency: "INR",
    price: "0",
    availability: "https://schema.org/InStock",
    eligibleRegion: {
      "@type": "City",
      name: "Bengaluru",
      alternateName: "Bangalore",
    },
    seller: {
      "@id": `${SITE_URL}/#organization`,
    },
    category: "Salon loyalty reward",
  }
}

export function buildLoyaltyOfferPath() {
  return SEO_LOYALTY_OFFER.path
}
