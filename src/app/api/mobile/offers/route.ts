import { jsonError, jsonOk } from "@/lib/auth/mobile-bearer"
import {
  getGlammzoOffersForMobileBanner,
  getGlammzoOffersForSalonDetail,
} from "@/lib/marketing/glammzo-offers"

/**
 * Public Glammzo offers for mobile.
 * Query: city, area, placement=salon|banner (default salon).
 * Returns CMS offers only (no hardcoded launch/welcome fallback).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const area = searchParams.get("area")
    const placement = searchParams.get("placement") === "banner" ? "banner" : "salon"

    const cmsOffers =
      placement === "banner"
        ? await getGlammzoOffersForMobileBanner({ city, area })
        : await getGlammzoOffersForSalonDetail({ city, area })

    const offers = cmsOffers.map((offer) => ({
      id: offer.id,
      title: offer.title,
      subtitle: offer.subtitle,
      description: offer.description,
      eyebrow: offer.eyebrow || "Glammzo offer",
      promoCode: offer.promoCode,
      cashbackRupees: offer.cashbackRupees,
      minOrderRupees: offer.minOrderRupees,
      mobileBannerUrl: offer.mobileBannerUrl,
      ctaLabel: offer.ctaLabel,
      ctaHref: offer.ctaHref,
    }))

    return jsonOk({ offers })
  } catch (error) {
    console.error("[mobile/offers]", error)
    return jsonError(500, "Could not load offers.")
  }
}
