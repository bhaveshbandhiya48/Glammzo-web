import { getSearchParam } from "@/lib/search-params"
import { isSalonInCity } from "@/lib/salons/city-filter"
import type { Salon } from "@/types/salon"

export const EXPLORE_CATEGORY_FILTERS = [
  { id: "all", label: "All" },
  { id: "hair", label: "Hair" },
  { id: "spa", label: "Spa" },
  { id: "nails", label: "Nails" },
  { id: "makeup", label: "Makeup" },
  { id: "grooming", label: "Grooming" },
] as const

export const EXPLORE_SORT_FILTERS = [
  { id: "recommended", label: "Recommended" },
  { id: "rating", label: "Top rated" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "nearest", label: "Nearest" },
] as const

export const EXPLORE_PRICE_FILTERS = [
  { id: "any", label: "Any price" },
  { id: "under-500", label: "Under ₹500" },
  { id: "500-1000", label: "₹500–₹1,000" },
  { id: "1000-plus", label: "₹1,000+" },
] as const

export const EXPLORE_RATING_FILTERS = [
  { id: "any", label: "Any rating" },
  { id: "4", label: "4.0+ stars" },
  { id: "4.5", label: "4.5+ stars" },
] as const

export const EXPLORE_RADIUS_FILTERS = [
  { id: "any", label: "Any distance", radiusKm: null },
  { id: "1", label: "Within 1 km", radiusKm: 1 },
  { id: "3", label: "Within 3 km", radiusKm: 3 },
  { id: "5", label: "Within 5 km", radiusKm: 5 },
  { id: "10", label: "Within 10 km", radiusKm: 10 },
  { id: "25", label: "Within 25 km", radiusKm: 25 },
] as const

export type ExploreCategoryId = string
export type ExploreSortId = (typeof EXPLORE_SORT_FILTERS)[number]["id"]
export type ExplorePriceId = (typeof EXPLORE_PRICE_FILTERS)[number]["id"]
export type ExploreRatingId = (typeof EXPLORE_RATING_FILTERS)[number]["id"]
export type ExploreRadiusId = (typeof EXPLORE_RADIUS_FILTERS)[number]["id"]

export type ExploreSearchParamsInput = {
  category?: string | string[]
  q?: string | string[]
  area?: string | string[]
  city?: string | string[]
  near?: string | string[]
  lat?: string | string[]
  lng?: string | string[]
  sort?: string | string[]
  price?: string | string[]
  rating?: string | string[]
  radius?: string | string[]
  open?: string | string[]
}

export type ExploreSearchState = {
  category: ExploreCategoryId
  query: string
  area: string
  city: string
  nearMode: boolean
  urlLatitude?: number
  urlLongitude?: number
  sort: ExploreSortId
  price: ExplorePriceId
  rating: ExploreRatingId
  radius: ExploreRadiusId
  openOnly: boolean
}

function isValidId<T extends string>(
  value: string,
  options: readonly { id: T }[]
): value is T {
  return options.some((option) => option.id === value)
}

function normalizeCategoryId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function parseExploreSearchParams(params: ExploreSearchParamsInput): ExploreSearchState {
  const categoryParam = getSearchParam(params.category, "all").toLowerCase()
  const sortParam = getSearchParam(params.sort, "recommended").toLowerCase()
  const priceParam = getSearchParam(params.price, "any").toLowerCase()
  const ratingParam = getSearchParam(params.rating, "any").toLowerCase()
  const radiusParam = getSearchParam(params.radius, "any").toLowerCase()
  const latParam = parseFloat(getSearchParam(params.lat))
  const lngParam = parseFloat(getSearchParam(params.lng))

  return {
    category: normalizeCategoryId(categoryParam) || "all",
    query: getSearchParam(params.q).trim(),
    area: getSearchParam(params.area).trim(),
    city: getSearchParam(params.city).trim(),
    nearMode: getSearchParam(params.near) === "1",
    urlLatitude: Number.isFinite(latParam) ? latParam : undefined,
    urlLongitude: Number.isFinite(lngParam) ? lngParam : undefined,
    sort: isValidId(sortParam, EXPLORE_SORT_FILTERS) ? sortParam : "recommended",
    price: isValidId(priceParam, EXPLORE_PRICE_FILTERS) ? priceParam : "any",
    rating: isValidId(ratingParam, EXPLORE_RATING_FILTERS) ? ratingParam : "any",
    radius: isValidId(radiusParam, EXPLORE_RADIUS_FILTERS) ? radiusParam : "any",
    openOnly: getSearchParam(params.open) === "1",
  }
}

export function buildExploreHref(
  state: ExploreSearchState,
  overrides: Partial<ExploreSearchState> = {}
): string {
  const next = { ...state, ...overrides }
  const sp = new URLSearchParams()

  if (next.category !== "all") sp.set("category", next.category)
  if (next.query) sp.set("q", next.query)
  if (next.nearMode && next.urlLatitude != null && next.urlLongitude != null) {
    sp.set("near", "1")
    sp.set("lat", String(next.urlLatitude))
    sp.set("lng", String(next.urlLongitude))
  } else if (next.city) {
    sp.set("city", next.city)
  } else if (next.area) {
    sp.set("area", next.area)
  }
  if (next.sort !== "recommended") sp.set("sort", next.sort)
  if (next.price !== "any") sp.set("price", next.price)
  if (next.rating !== "any") sp.set("rating", next.rating)
  if (next.radius !== "any") sp.set("radius", next.radius)
  if (next.openOnly) sp.set("open", "1")

  const qs = sp.toString()
  return qs ? `/explore?${qs}` : "/explore"
}

export function hasSecondaryExploreFilters(state: ExploreSearchState): boolean {
  return (
    state.sort !== "recommended" ||
    state.price !== "any" ||
    state.rating !== "any" ||
    state.radius !== "any" ||
    state.openOnly
  )
}

export function hasAnyExploreFilters(state: ExploreSearchState): boolean {
  return (
    state.category !== "all" ||
    Boolean(state.query) ||
    Boolean(state.area) ||
    Boolean(state.city) ||
    state.nearMode ||
    state.radius !== "any" ||
    hasSecondaryExploreFilters(state)
  )
}

export function resolveExploreRadiusKm(radius: ExploreRadiusId): number | null {
  return EXPLORE_RADIUS_FILTERS.find((f) => f.id === radius)?.radiusKm ?? null
}

function matchesPriceFilter(priceFrom: number, price: ExplorePriceId): boolean {
  if (price === "any") return true
  if (priceFrom <= 0) return true
  if (price === "under-500") return priceFrom < 500
  if (price === "500-1000") return priceFrom >= 500 && priceFrom <= 1000
  return priceFrom > 1000
}

function matchesRatingFilter(rating: number, reviews: number, minRating: ExploreRatingId): boolean {
  if (minRating === "any") return true
  if (rating <= 0 || reviews <= 0) return false
  if (minRating === "4") return rating >= 4
  return rating >= 4.5
}

export function filterExploreSalons(
  salons: Salon[],
  state: Pick<ExploreSearchState, "query" | "area" | "city" | "nearMode" | "price" | "rating" | "openOnly">
): Salon[] {
  let result = salons

  if (state.query) {
    const q = state.query.toLowerCase()
    result = result.filter(
      (salon) =>
        salon.name.toLowerCase().includes(q) ||
        salon.area.toLowerCase().includes(q) ||
        salon.services.some(
          (service) =>
            service.name.toLowerCase().includes(q) ||
            service.category.toLowerCase().includes(q)
        )
    )
  }

  if (state.city) {
    result = result.filter((salon) => isSalonInCity(salon, state.city))
  } else if (!state.nearMode && state.area) {
    const area = state.area.toLowerCase()
    result = result.filter((salon) => salon.area.toLowerCase().includes(area))
  }

  if (state.price !== "any") {
    result = result.filter((salon) => matchesPriceFilter(salon.priceFrom, state.price))
  }

  if (state.rating !== "any") {
    result = result.filter((salon) =>
      matchesRatingFilter(salon.rating, salon.reviews, state.rating)
    )
  }

  if (state.openOnly) {
    result = result.filter((salon) => salon.isOpenNow)
  }

  return result
}

function recommendScore(salon: Salon): number {
  let score = 0
  if (salon.isFeatured) score += 1_000
  if (salon.rating > 0) score += salon.rating * 100
  score += Math.min(salon.reviews, 200)
  if (salon.isOpenNow) score += 10
  return score
}

export function sortExploreSalons(salons: Salon[], sort: ExploreSortId): Salon[] {
  if (sort === "nearest") {
    return salons
  }

  const sorted = [...salons]

  if (sort === "recommended") {
    return sorted.sort((a, b) => recommendScore(b) - recommendScore(a))
  }

  if (sort === "rating") {
    return sorted.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating
      return b.reviews - a.reviews
    })
  }

  if (sort === "price-asc") {
    return sorted.sort((a, b) => {
      const aPrice = a.priceFrom > 0 ? a.priceFrom : Number.POSITIVE_INFINITY
      const bPrice = b.priceFrom > 0 ? b.priceFrom : Number.POSITIVE_INFINITY
      return aPrice - bPrice
    })
  }

  return sorted.sort((a, b) => b.priceFrom - a.priceFrom)
}

export function getExploreCities(salons: Salon[]): string[] {
  const cities = new Set<string>()
  for (const salon of salons) {
    const city = salon.city?.trim() || salon.area?.trim()
    if (city) cities.add(city)
  }
  return [...cities].sort((a, b) => a.localeCompare(b))
}

export function getFeaturedSalons(salons: Salon[]): Salon[] {
  return salons.filter((salon) => salon.isFeatured)
}

export function getExploreCategoryLabel(category: ExploreCategoryId): string {
  const known = EXPLORE_CATEGORY_FILTERS.find((filter) => filter.id === category)?.label
  if (known) return known
  if (category === "all") return "All"

  return category
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
