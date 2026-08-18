import { GlammzoOfferStrip } from "@/components/marketing/glammzo-offer-strip"
import { getBrowseCityFromCookies } from "@/lib/categories/browse-city"
import { getGlammzoOfferForWebStrip } from "@/lib/marketing/glammzo-offers"

type MarketingOfferStripProps = {
  showBookCta?: boolean
}

/**
 * CMS Glammzo offer strip when an active strip offer matches the browse city
 * (or is nationwide). Hidden when no CMS offer is configured.
 */
export async function MarketingOfferStrip({
  showBookCta = true,
}: MarketingOfferStripProps) {
  const city = await getBrowseCityFromCookies()
  const cmsOffer = await getGlammzoOfferForWebStrip(city)

  if (!cmsOffer) {
    return null
  }

  return <GlammzoOfferStrip offer={cmsOffer} showBookCta={showBookCta} />
}
