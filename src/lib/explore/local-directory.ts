import type { Salon } from "@/types/salon"
import { getSalonAreasForCity, normalizeCityName } from "@/lib/salons/city-filter"
import { buildExploreAreaHref } from "@/lib/seo/local-landing"

/** Curated neighbourhoods when a city has no published salon areas yet. */
export const EXPLORE_AREA_FALLBACKS: Record<string, readonly string[]> = {
  bengaluru: [
    "Indiranagar",
    "Koramangala",
    "HSR Layout",
    "Whitefield",
    "Jayanagar",
    "MG Road",
    "JP Nagar",
    "Marathahalli",
    "BTM Layout",
    "Electronic City",
    "Yelahanka",
    "Malleshwaram",
  ],
  ahmedabad: [
    "Gurukul",
    "Bodakdev",
    "Gota",
    "Bopal",
    "Satellite",
    "Shyamal",
    "Prahladnagar",
    "South Bopal",
    "Nikol",
    "Sindhu Bhavan",
    "Vastrapur",
    "Ashram Road",
  ],
  mumbai: [
    "Andheri",
    "Bandra",
    "Powai",
    "Juhu",
    "Lower Parel",
    "Colaba",
    "Worli",
    "Malad",
  ],
  delhi: [
    "Connaught Place",
    "Saket",
    "Hauz Khas",
    "Dwarka",
    "Rohini",
    "Karol Bagh",
    "Vasant Kunj",
    "Lajpat Nagar",
  ],
  pune: ["Koregaon Park", "Baner", "Hinjewadi", "Kothrud", "Viman Nagar", "Aundh"],
  hyderabad: ["Hitech City", "Gachibowli", "Banjara Hills", "Jubilee Hills", "Madhapur"],
  chennai: ["T Nagar", "Adyar", "Anna Nagar", "Velachery", "Nungambakkam"],
  jamnagar: ["Indira Gandhi Road", "Patel Colony", "Bedeshwar", "Digvijay Plot"],
  ajmer: [
    "Vaishali Nagar",
    "Civil Lines",
    "Ana Sagar",
    "Foysagar Road",
    "Adarsh Nagar",
    "Panchsheel Nagar",
    "Shastri Nagar",
    "Madanganj",
    "Makupura",
    "Diggi Bazaar",
  ],
  jaipur: [
    "C Scheme",
    "Malviya Nagar",
    "Vaishali Nagar",
    "Mansarovar",
    "Raja Park",
    "Bani Park",
  ],
}

const FALLBACK_CITY_LABELS: Record<string, string> = {
  bengaluru: "Bengaluru",
  ahmedabad: "Ahmedabad",
  mumbai: "Mumbai",
  delhi: "Delhi",
  pune: "Pune",
  hyderabad: "Hyderabad",
  chennai: "Chennai",
  jamnagar: "Jamnagar",
  ajmer: "Ajmer",
  jaipur: "Jaipur",
}

export const EXPLORE_AREA_DIRECTORY_PREVIEW = 12

export function getExploreAreasForCity(salons: Salon[], city: string): string[] {
  const fromSalons = getSalonAreasForCity(salons, city)
  if (fromSalons.length > 0) return fromSalons

  const key = normalizeCityName(city)
  return [...(EXPLORE_AREA_FALLBACKS[key] ?? [])]
}

/**
 * City → area labels for Explore directory.
 * Keys are normalizeCityName(); display names kept separately via cityLabels.
 */
export function buildExploreAreaDirectory(salons: Salon[]): {
  areasByCity: Record<string, string[]>
  cityLabels: Record<string, string>
} {
  const areasByCity: Record<string, string[]> = {}
  const cityLabels: Record<string, string> = {}

  const register = (displayCity: string) => {
    const key = normalizeCityName(displayCity)
    if (!key || areasByCity[key]) return
    areasByCity[key] = getExploreAreasForCity(salons, displayCity)
    cityLabels[key] = displayCity.trim()
  }

  for (const salon of salons) {
    if (salon.city?.trim()) register(salon.city)
  }

  for (const key of Object.keys(EXPLORE_AREA_FALLBACKS)) {
    register(FALLBACK_CITY_LABELS[key] ?? key)
  }

  return { areasByCity, cityLabels }
}

export function resolveExploreDirectoryCity(input: {
  city?: string | null
  area?: string | null
  fallbackCity: string
}): string {
  const city = input.city?.trim()
  if (city) return city
  const area = input.area?.trim()
  if (area) return area
  return input.fallbackCity
}

export function buildExploreDirectoryLinks(cityDisplayName: string, areas: string[]) {
  return areas.map((area) => ({
    area,
    href: buildExploreAreaHref(cityDisplayName, area),
    label: `Salons in ${area}`,
  }))
}
