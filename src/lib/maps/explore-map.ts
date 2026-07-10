import { distanceToSalonKm, getSalonCoordinates } from "@/lib/geo"
import { DEFAULT_MAP_CENTER } from "@/lib/maps/config"
import type { NearbySalonRecord } from "@/lib/maps/nearby-salon.types"
import type { Salon } from "@/types/salon"

export function mapSalonToNearbyRecord(
  salon: Salon,
  center?: { latitude: number; longitude: number } | null,
): NearbySalonRecord {
  const coords = getSalonCoordinates(salon)
  const distanceKm =
    center != null
      ? distanceToSalonKm(salon, center.latitude, center.longitude)
      : salon.distanceKm > 0
        ? salon.distanceKm
        : 0

  return {
    id: salon.id,
    slug: salon.id,
    name: salon.name,
    area: salon.area,
    city: salon.area,
    state: "",
    country: "",
    fullAddress: salon.address,
    latitude: coords.lat,
    longitude: coords.lng,
    imageUrl: salon.imageUrl,
    coverImageUrl: salon.coverImageUrl,
    rating: salon.rating,
    reviewCount: salon.reviews,
    priceFrom: salon.priceFrom,
    isOpenNow: salon.isOpenNow,
    distanceKm,
    services: salon.services.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      durationMin: service.durationMin,
      category: service.category,
    })),
  }
}

export function mapSalonsToNearbyRecords(
  salons: Salon[],
  center?: { latitude: number; longitude: number } | null,
): NearbySalonRecord[] {
  return salons.map((salon) => mapSalonToNearbyRecord(salon, center))
}

/** Minimal Salon shape for reusing SalonCard outside the explore list grid. */
export function nearbyRecordToSalonPreview(record: NearbySalonRecord): Salon {
  return {
    id: record.slug || record.id,
    name: record.name,
    area: record.area,
    imageUrl: record.imageUrl,
    coverImageUrl: record.coverImageUrl || record.imageUrl,
    rating: record.rating,
    reviews: record.reviewCount,
    distanceKm: record.distanceKm,
    latitude: record.latitude,
    longitude: record.longitude,
    isOpenNow: record.isOpenNow,
    priceFrom: record.priceFrom,
    description: "",
    address: record.fullAddress,
    phone: "",
    hours: "",
    services: [],
    gallery: [],
    customerReviews: [],
    team: [],
  }
}

export function getFallbackMapCenter(salons: Salon[]) {
  if (salons.length === 0) {
    return {
      latitude: DEFAULT_MAP_CENTER.latitude,
      longitude: DEFAULT_MAP_CENTER.longitude,
    }
  }

  const coords = getSalonCoordinates(salons[0]!)
  return { latitude: coords.lat, longitude: coords.lng }
}
