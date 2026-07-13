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
  staffSchedules: Record<string, Partial<Record<Weekday, DaySchedule>>>
  webBooking: {
    responseSlaMinutes: number
  }
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
}

export type CreateCrmBookingResult =
  | {
      success: true
      appointmentId: string
      staffId: string
      endTime: string
    }
  | {
      success: false
      error: string
      code?: "slot_taken" | "not_ready" | "invalid"
    }
