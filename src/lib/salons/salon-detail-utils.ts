import type { Salon, SalonAmenityCategory } from "@/types/salon"

export function primarySalonCategory(salon: Pick<Salon, "services">) {
  const categories = salon.services.map((service) => service.category).filter(Boolean)
  if (categories.length === 0) return "Salon & wellness"
  const counts = new Map<string, number>()
  for (const name of categories) {
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  let best = categories[0]!
  let max = 0
  for (const [name, count] of counts) {
    if (count > max) {
      max = count
      best = name
    }
  }
  return best
}

export function salonDirectionsUrl(salon: Pick<Salon, "latitude" | "longitude" | "address">) {
  if (salon.latitude != null && salon.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${salon.latitude},${salon.longitude}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address)}`
}

export function formatCustomerCountLabel(reviewCount: number) {
  if (reviewCount >= 10_000) return "10K+ guests"
  if (reviewCount >= 1_000) return `${Math.floor(reviewCount / 1000)}K+ guests`
  if (reviewCount > 0) return `${reviewCount.toLocaleString()} reviews`
  return "New on Glammzo"
}

export function amenityChipLabel(category: SalonAmenityCategory) {
  return category.name
}

export function findAmenityByIcon(
  categories: SalonAmenityCategory[] | undefined,
  icon: string,
) {
  return categories?.find((item) => item.icon === icon)
}
