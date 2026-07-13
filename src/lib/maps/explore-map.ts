import { computeSalonDistanceKm } from "@/lib/explore-distance"
import { haversineKm } from "@/lib/geo"
import { DEFAULT_MAP_CENTER } from "@/lib/maps/config"
import { resolveSalonCoordinates } from "@/lib/salon-coordinates"
import type { NearbySalonRecord } from "@/lib/maps/nearby-salon.types"
import type { Salon } from "@/types/salon"

export function mapSalonToNearbyRecord(
  salon: Salon,
  center?: { latitude: number; longitude: number } | null,
): NearbySalonRecord | null {
  const coords = resolveSalonCoordinates(salon)
  if (!coords) {
    return null
  }

  const distanceKm =
    center != null
      ? haversineKm(center.latitude, center.longitude, coords.lat, coords.lng)
      : computeSalonDistanceKm(salon, {
          latitude: DEFAULT_MAP_CENTER.latitude,
          longitude: DEFAULT_MAP_CENTER.longitude,
          isDefaultCity: true,
        }) ?? 0

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
  return salons
    .map((salon) => mapSalonToNearbyRecord(salon, center))
    .filter((salon): salon is NearbySalonRecord => salon !== null)
}

/** Map center for explore, user GPS when available, otherwise Bengaluru default. */
export function getExploreMapCenter(origin: { latitude: number; longitude: number }) {
  return {
    latitude: origin.latitude,
    longitude: origin.longitude,
  }
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
    packages: [],
    offers: [],
    services: [],
    gallery: [],
    customerReviews: [],
    team: [],
  }
}

export function getFallbackMapCenter() {
  return {
    latitude: DEFAULT_MAP_CENTER.latitude,
    longitude: DEFAULT_MAP_CENTER.longitude,
  }
}
