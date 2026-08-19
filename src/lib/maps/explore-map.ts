import { computeSalonDistanceKm } from "@/lib/explore-distance"
import { haversineKm } from "@/lib/geo"
import { DEFAULT_MAP_CENTER } from "@/lib/maps/config"
import { resolveSalonCoordinates } from "@/lib/salon-coordinates"
import type { NearbySalonRecord } from "@/lib/maps/nearby-salon.types"
import { pickBestSalonOffer } from "@/lib/salons/offer-utils"
import type { Salon, SalonOffer } from "@/types/salon"

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

  const bestOffer = pickBestSalonOffer(salon.offers)

  return {
    id: salon.id,
    slug: salon.id,
    name: salon.name,
    area: salon.area,
    city: salon.city ?? "",
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
    businessType: salon.businessType?.trim() || null,
    offerBadge: bestOffer
      ? {
          discountType: bestOffer.discountType,
          discountValue: bestOffer.discountValue,
        }
      : null,
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

function previewOfferFromBadge(
  badge: NonNullable<NearbySalonRecord["offerBadge"]>,
): SalonOffer {
  return {
    id: "preview-offer",
    code: "OFFER",
    title: "Salon offer",
    description: null,
    discountType: badge.discountType,
    discountValue: badge.discountValue,
    appliesTo: "all_services",
    serviceIds: [],
    packageIds: [],
    startsAt: null,
    endsAt: null,
    maxRedemptions: null,
    redemptionCount: 0,
    isActive: true,
    minOrderRupees: null,
    customerEligibility: "all_customers",
    terms: null,
    ctaLabel: "Book now",
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
    businessType: record.businessType,
    description: "",
    address: record.fullAddress,
    phone: "",
    hours: "",
    packages: [],
    offers: record.offerBadge ? [previewOfferFromBadge(record.offerBadge)] : [],
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
