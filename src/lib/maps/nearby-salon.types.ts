import type { SalonService } from "@/types/salon"

export type NearbySalonRecord = {
  id: string
  slug: string
  name: string
  area: string
  city: string
  state: string
  country: string
  fullAddress: string
  latitude: number
  longitude: number
  imageUrl: string
  coverImageUrl: string
  rating: number
  reviewCount: number
  priceFrom: number
  isOpenNow: boolean
  distanceKm: number
  services: Array<Pick<SalonService, "id" | "name" | "price" | "durationMin" | "category">>
}

export type NearbySalonsRequest = {
  latitude: number
  longitude: number
  radiusKm?: number
  query?: string
  limit?: number
}

export type NearbySalonsResponse = {
  salons: NearbySalonRecord[]
  center: { latitude: number; longitude: number }
  radiusKm: number
  total: number
}
