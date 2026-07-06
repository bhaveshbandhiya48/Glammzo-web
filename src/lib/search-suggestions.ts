import { salons } from "@/data/salons"

export const RECENT_SEARCHES_KEY = "glamzzo_recent_searches"
export const MAX_RECENT_SEARCHES = 5

export type RecentSearch = {
  q: string
  area: string
  ts: number
}

export const POPULAR_SEARCHES = [
  "Haircut",
  "Facial",
  "Gel nails",
  "Bridal makeup",
  "Spa massage",
] as const

export const POPULAR_AREAS = [
  "Indiranagar",
  "Koramangala",
  "HSR Layout",
  "MG Road",
] as const

export const SEARCH_CATEGORIES = [
  { id: "hair", label: "Hair", keywords: ["hair", "haircut", "color", "blowout", "styling"] },
  { id: "spa", label: "Spa", keywords: ["spa", "facial", "massage", "aromatherapy"] },
  { id: "nails", label: "Nails", keywords: ["nails", "manicure", "pedicure", "gel"] },
  { id: "makeup", label: "Makeup", keywords: ["makeup", "bridal", "party", "glam"] },
  { id: "grooming", label: "Grooming", keywords: ["grooming", "beard", "brow"] },
] as const

export type ServiceSuggestion = {
  name: string
  salonName: string
  salonId: string
  category: string
  price: number
}

export type SearchSuggestions = {
  salons: typeof salons
  services: ServiceSuggestion[]
  categories: (typeof SEARCH_CATEGORIES)[number][]
}

export function getAllAreas(): string[] {
  const fromSalons = salons.map((s) => s.area)
  return [...new Set([...POPULAR_AREAS, ...fromSalons])].sort()
}

export function getAreaSuggestions(query: string): string[] {
  const q = query.trim().toLowerCase()
  const areas = getAllAreas()
  if (!q) return areas
  return areas.filter((area) => area.toLowerCase().includes(q))
}

export function getSearchSuggestions(query: string): SearchSuggestions {
  const q = query.trim().toLowerCase()
  if (!q) {
    return { salons: [], services: [], categories: [] }
  }

  const matchedSalons = salons
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.services.some((svc) => svc.name.toLowerCase().includes(q))
    )
    .slice(0, 4)

  const services: ServiceSuggestion[] = []
  for (const salon of salons) {
    for (const svc of salon.services) {
      if (
        svc.name.toLowerCase().includes(q) ||
        svc.category.toLowerCase().includes(q)
      ) {
        services.push({
          name: svc.name,
          salonName: salon.name,
          salonId: salon.id,
          category: svc.category,
          price: svc.price,
        })
      }
    }
  }

  const categories = SEARCH_CATEGORIES.filter(
    (cat) =>
      cat.label.toLowerCase().includes(q) ||
      cat.id.includes(q) ||
      cat.keywords.some((kw) => kw.includes(q) || q.includes(kw))
  ).slice(0, 3)

  return {
    salons: matchedSalons,
    services: services.slice(0, 5),
    categories,
  }
}

export function readRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentSearch[]
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : []
  } catch {
    return []
  }
}

export function saveRecentSearch(q: string, area: string) {
  if (typeof window === "undefined") return
  const trimmedQ = q.trim()
  const trimmedArea = area.trim()
  if (!trimmedQ && !trimmedArea) return

  try {
    const existing = readRecentSearches().filter(
      (item) => item.q !== trimmedQ || item.area !== trimmedArea
    )
    const next: RecentSearch[] = [
      { q: trimmedQ, area: trimmedArea, ts: Date.now() },
      ...existing,
    ].slice(0, MAX_RECENT_SEARCHES)
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
  } catch {
    // ignore storage errors
  }
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {
    // ignore
  }
}

export function buildExploreHref(q?: string, area?: string, category?: string) {
  const sp = new URLSearchParams()
  if (q?.trim()) sp.set("q", q.trim())
  if (area?.trim()) sp.set("area", area.trim())
  if (category) sp.set("category", category)
  const qs = sp.toString()
  return qs ? `/explore?${qs}` : "/explore"
}
