export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export type DaySchedule = {
  enabled: boolean
  open: string
  close: string
}

export type BusinessHoursSettings = {
  openingTime?: string
  closingTime?: string
  weeklySchedule: Record<Weekday, DaySchedule>
}

export type BookedAppointment = {
  /** Empty when the booking has no assigned staff yet (still blocks the slot). */
  staffId: string
  date: string
  startTime: string
  endTime: string
}

export type BookableStaffMember = {
  id: string
  name: string
  role: string
  imageUrl: string | null
}

export type SalonBookingContext = {
  crmSalonId: string
  salonName: string
  timezone: string
  businessHours: BusinessHoursSettings
  businessClosures: import("@/lib/bookings/crm/booking-confirmation-engine").BusinessClosure[]
  staffIds: string[]
  staffMembers: BookableStaffMember[]
  staffServiceMap: Record<string, string[]>
  staffCategoryMap: Record<string, string[]>
  serviceCategoryMap: Record<string, string>
  categoryAssignmentsEnabled: boolean
  staffSchedules: Record<string, Partial<Record<Weekday, DaySchedule>>>
  webBooking: {
    confirmationMode: import("@/lib/bookings/crm/booking-confirmation-engine").BookingConfirmationMode
    confirmationRequired: boolean
    responseSlaMinutes: number
  }
  /** Present when salon GST is enabled with a GSTIN. */
  tax: import("@/types/salon").SalonTaxInfo | null
  booked: BookedAppointment[]
}

export type CreateCrmBookingInput = {
  crmSalonId: string
  serviceIds: string[]
  appointmentDate: string
  startTime: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  notes?: string
  preferredStaffId?: string
  packageBooking?: boolean
  packageId?: string
  promoCode?: string
  marketingOptIn?: boolean
  /** Apply Glammzo wallet credit (rupees will be converted to paise server-side if needed). */
  useWallet?: boolean
  walletAmountPaise?: number
  /** Redeem one loyalty credit: up to ₹999 off one service (free if ≤ ₹999). */
  useFreeService?: boolean
  /** Per-finger / per-hand counts. Other units always persist as 1. */
  serviceQuantities?: Record<string, number>
}

export type CreateCrmBookingResult =
  | {
      success: true
      appointmentId: string
      staffId: string
      endTime: string
      bookingMode: import("@/lib/bookings/crm/booking-confirmation-engine").BookingConfirmationMode
      appointmentStatus: "confirmed" | "pending"
      confirmationRequired: boolean
      confirmationDeadline: string | null
      remainingConfirmationTime: number | null
      /** Payable after promo / loyalty / wallet — what the guest pays at the salon. */
      payAtSalonRupees: number
      /** Catalog / package subtotal before wallet + loyalty. */
      subtotalRupees: number
    }
  | {
      success: false
      error: string
      code?: "slot_taken" | "not_ready" | "invalid"
    }
