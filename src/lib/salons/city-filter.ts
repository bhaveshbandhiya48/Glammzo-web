import type { Salon } from "@/types/salon"

const CITY_ALIASES: Record<string, string> = {
  bangalore: "bengaluru",
  bengaluru: "bengaluru",
}

export function normalizeCityName(value: string | null | undefined): string {
  const normalized = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

  return CITY_ALIASES[normalized] ?? normalized
}

export function isSalonInCity(salon: Salon, city: string): boolean {
  const selectedCity = normalizeCityName(city)
  const salonCity = normalizeCityName(salon.city)

  return Boolean(selectedCity && salonCity && selectedCity === salonCity)
}

export function filterSalonsByCity(salons: Salon[], city: string): Salon[] {
  return salons.filter((salon) => isSalonInCity(salon, city))
}

/**
 * Prefer exact city matches. When none exist yet, keep showing other published
 * partners so launch cities outside the default browse city are not invisible.
 */
export function filterSalonsByCityPreferExact(
  salons: Salon[],
  city: string,
): { salons: Salon[]; usedFallback: boolean } {
  if (!city.trim()) {
    return { salons, usedFallback: false }
  }

  const matched = filterSalonsByCity(salons, city)
  if (matched.length > 0) {
    return { salons: matched, usedFallback: false }
  }

  return { salons, usedFallback: salons.length > 0 }
}
