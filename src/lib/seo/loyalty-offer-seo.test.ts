import { describe, expect, it } from "vitest"

import {
  LOYALTY_OFFER_FAQS,
  SEO_LOYALTY_OFFER,
  buildLoyaltyOfferJsonLd,
} from "@/lib/seo/loyalty-offer-seo"
import { SEO_HOME } from "@/lib/seo/site-seo"

describe("loyalty offer SEO", () => {
  it("leads titles with Get ₹999 off", () => {
    expect(SEO_HOME.title.startsWith("Get ₹999 Off")).toBe(true)
    expect(SEO_LOYALTY_OFFER.title.startsWith("Get ₹999 Off")).toBe(true)
    expect(SEO_LOYALTY_OFFER.h1.toLowerCase()).toContain("every 10th")
  })

  it("emits an Offer schema for the loyalty reward", () => {
    const offer = buildLoyaltyOfferJsonLd()
    expect(offer["@type"]).toBe("Offer")
    expect(offer.name).toContain("₹999")
    expect(offer.url).toContain("/get-999-off")
  })

  it("answers how to get ₹999 off without a promo code", () => {
    expect(LOYALTY_OFFER_FAQS[0]?.question).toContain("₹999 off")
    expect(LOYALTY_OFFER_FAQS.some((faq) => faq.answer.toLowerCase().includes("no code"))).toBe(
      true,
    )
  })
})
