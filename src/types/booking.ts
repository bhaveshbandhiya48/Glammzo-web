export type BookingStatus =
  | "pending"
  | "confirmed"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "declined"

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
  /** CRM appointment id when booked via Supabase. */
  crmAppointmentId?: string
  /** True only when CRM appointment status is `completed`. */
  isCrmCompleted?: boolean
  /** True only when a verified customer review already exists. */
  hasVerifiedReview?: boolean
  /** Assigned team member for this visit (CRM). */
  staffId?: string
  staffName?: string
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
  /** Shown when salon declined the booking request. */
  declineReason?: string
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
