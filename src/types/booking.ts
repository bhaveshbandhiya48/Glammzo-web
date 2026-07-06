export type BookingStatus = "confirmed" | "upcoming" | "completed" | "cancelled"

export type BookingServiceItem = {
  id: string
  name: string
  price: number
  durationMin: number
}

export type Booking = {
  id: string
  salonId: string
  salonName: string
  salonArea: string
  /** One or more services in the same visit */
  services: BookingServiceItem[]
  date: string
  time: string
  /** Total price for all services */
  price: number
  /** Total visit duration in minutes */
  durationMin: number
  notes?: string
  status: BookingStatus
  createdAt: string
}

/** Legacy single-service shape (cookie data from older builds) */
export type LegacyBooking = Booking & {
  serviceId?: string
  serviceName?: string
}

export function normalizeBooking(raw: LegacyBooking): Booking {
  if (raw.services?.length) return raw as Booking
  if (raw.serviceId && raw.serviceName) {
    return {
      ...raw,
      services: [
        {
          id: raw.serviceId,
          name: raw.serviceName,
          price: raw.price,
          durationMin: raw.durationMin ?? 0,
        },
      ],
      durationMin: raw.durationMin ?? 0,
    }
  }
  return { ...raw, services: raw.services ?? [], durationMin: raw.durationMin ?? 0 }
}
