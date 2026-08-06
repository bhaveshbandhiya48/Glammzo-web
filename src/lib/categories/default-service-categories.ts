import "server-only"

import { cache } from "react"

import {
  BUSINESS_TYPE_CATALOG,
  businessTypeSlugFromLabel,
  type BusinessTypePresentation,
} from "@/lib/categories/business-types"
import { filterSalonsByCity } from "@/lib/salons/city-filter"
import { getSalons } from "@/lib/salons"
import type { Category } from "@/types/landing"
import type { Salon } from "@/types/salon"

function buildBusinessTypeCategory(
  presentation: BusinessTypePresentation,
  salons: Salon[],
): Category {
  const prices = salons
    .map((salon) => salon.priceFrom)
    .filter((price) => Number.isFinite(price) && price > 0)
  const fromPrice = prices.length > 0 ? Math.min(...prices) : null

  return {
    id: presentation.slug,
    title: presentation.title,
    subtitle: presentation.label,
    icon: presentation.icon,
    services: [],
    eyebrow: presentation.label,
    description: presentation.description,
    imageUrl: presentation.imageUrl,
    overlay: {
      badge: presentation.overlayBadge,
      title: presentation.label,
      subtitle: fromPrice
        ? `${salons.length} salon${salons.length === 1 ? "" : "s"} · From ₹${Math.round(fromPrice).toLocaleString("en-IN")}`
        : `${salons.length} salon${salons.length === 1 ? "" : "s"}`,
    },
    variant: presentation.variant,
  }
}

/**
 * Business-type browse cards (home stack + /services).
 * Only types with at least one published salon in scope are returned.
 * When `city` is set, only salons in that city count.
 */
export const getBrowseBusinessTypes = cache(
  async (city?: string | null): Promise<Category[]> => {
    const allSalons = await getSalons()
    const salons = city?.trim() ? filterSalonsByCity(allSalons, city) : allSalons

    const salonsByType = new Map<string, Salon[]>()
    for (const salon of salons) {
      const slug = businessTypeSlugFromLabel(salon.businessType)
      if (!slug) continue
      const list = salonsByType.get(slug) ?? []
      list.push(salon)
      salonsByType.set(slug, list)
    }

    return BUSINESS_TYPE_CATALOG.map((presentation) => {
      const matched = salonsByType.get(presentation.slug) ?? []
      return matched.length > 0
        ? buildBusinessTypeCategory(presentation, matched)
        : null
    }).filter((category): category is Category => category !== null)
  },
)

/** @deprecated Prefer getBrowseBusinessTypes — kept for existing imports. */
export const getBrowseDefaultCategories = getBrowseBusinessTypes
