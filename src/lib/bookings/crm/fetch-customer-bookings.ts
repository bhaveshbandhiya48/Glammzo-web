import "server-only"

import { formatSlotLabel } from "@/lib/bookings/crm/availability"
import {
  extractDeclineReasonForDisplay,
  mapCrmAppointmentToBookingStatus,
} from "@/lib/bookings/booking-status"
import {
  parseSalonCancelPolicyFromSettings,
  resolveCustomerCancelNoticeHours,
} from "@/lib/bookings/cancel-policy"
import { parsePayAtSalonAmount } from "@/lib/bookings/utils"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Booking, BookingReview, BookingServiceItem, BookingStatus } from "@/types/booking"

type AppointmentRow = {
  id: string
  salon_id: string
  service_id: string | null
  appointment_date: string
  start_time: string
  starts_at: string | null
  duration_minutes: number
  status: string
  notes: string | null
  booking_source: string | null
  internal_notes: string | null
  cancellation_reason: string | null
  expires_at: string | null
  response_deadline: string | null
  created_at: string
  staff_id: string | null
  salons: {
    id: string
    name: string
    slug: string
    city: string | null
    settings?: unknown
  } | null
  services: {
    id: string
    name: string
    price: string
    duration_minutes: number
  } | null
  staff: { full_name: string } | { full_name: string }[] | null
}

type AppointmentServiceRow = {
  service_id: string
  sort_order: number
  price: string | number
  duration_minutes: number
  services: {
    id: string
    name: string
    price: string
    duration_minutes: number
  } | null
}

function parseServicesFromNotes(
  notes: string | null,
  primary: AppointmentRow["services"],
): BookingServiceItem[] {
  const prefix = "Web booking:"
  const line = notes?.split("\n")[0]?.trim() ?? ""

  if (line.startsWith(prefix)) {
    const names = line
      .slice(prefix.length)
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)

    if (names.length > 0) {
      return names.map((name, index) => ({
        id: primary?.id ? `${primary.id}-${index}` : `svc-${index}`,
        name,
        price:
          index === 0 && primary ? Number.parseFloat(primary.price) || 0 : 0,
        durationMin: index === 0 && primary ? primary.duration_minutes : 0,
      }))
    }
  }

  if (primary) {
    return [
      {
        id: primary.id,
        name: primary.name,
        price: Number.parseFloat(primary.price) || 0,
        durationMin: primary.duration_minutes,
      },
    ]
  }

  return [{ id: "service", name: "Salon visit", price: 0, durationMin: 0 }]
}

function mapAppointmentServiceRow(row: AppointmentServiceRow): BookingServiceItem {
  const service = Array.isArray(row.services) ? row.services[0] : row.services
  return {
    id: service?.id ?? row.service_id,
    name: service?.name ?? "Service",
    price: Number.parseFloat(String(row.price ?? service?.price ?? 0)) || 0,
    durationMin: row.duration_minutes || service?.duration_minutes || 0,
  }
}

async function fetchAppointmentServices(
  supabase: ReturnType<typeof createAdminClient>,
  appointmentIds: string[],
): Promise<Map<string, BookingServiceItem[]>> {
  if (appointmentIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from("appointment_services")
    .select(
      `
      appointment_id,
      service_id,
      sort_order,
      price,
      duration_minutes,
      services ( id, name, price, duration_minutes )
    `,
    )
    .in("appointment_id", appointmentIds)
    .order("sort_order", { ascending: true })

  if (error || !data) {
    return new Map()
  }

  const grouped = new Map<string, BookingServiceItem[]>()

  for (const row of (data ?? []) as unknown as Array<
    AppointmentServiceRow & { appointment_id: string }
  >) {
    const items = grouped.get(row.appointment_id) ?? []
    items.push(mapAppointmentServiceRow(row))
    grouped.set(row.appointment_id, items)
  }

  return grouped
}

const APPOINTMENT_SELECT = `
  id,
  salon_id,
  service_id,
  appointment_date,
  start_time,
  starts_at,
  duration_minutes,
  status,
  notes,
  booking_source,
  internal_notes,
  cancellation_reason,
  expires_at,
  response_deadline,
  created_at,
  staff_id,
  salons ( id, name, slug, city, settings ),
  services ( id, name, price, duration_minutes ),
  staff ( full_name )
`

function mapAppointmentRow(
  row: AppointmentRow,
  extras: {
    linkedServices?: BookingServiceItem[]
    review?: BookingReview
  } = {},
): Booking {
  const salon = Array.isArray(row.salons) ? row.salons[0] : row.salons
  const service = Array.isArray(row.services) ? row.services[0] : row.services
  const staff = Array.isArray(row.staff) ? row.staff[0] : row.staff
  const services =
    extras.linkedServices && extras.linkedServices.length > 0
      ? extras.linkedServices
      : parseServicesFromNotes(row.notes, service ?? null)
  const serviceTotal = services.reduce((total, item) => total + item.price, 0)
  const payAtSalon = parsePayAtSalonAmount(row.notes, row.internal_notes)
  const price = payAtSalon ?? serviceTotal
  const durationMin =
    row.duration_minutes || services.reduce((total, item) => total + item.durationMin, 0)
  const status: BookingStatus = mapCrmAppointmentToBookingStatus({
    status: row.status,
    appointmentDate: row.appointment_date,
    cancellationReason: row.cancellation_reason,
    bookingSource: row.booking_source,
    internalNotes: row.internal_notes,
    expiresAt: row.expires_at ?? row.response_deadline,
  })
  const cancelPolicy = parseSalonCancelPolicyFromSettings(salon?.settings)
  const cancelNoticeHours = resolveCustomerCancelNoticeHours(cancelPolicy)

  return {
    id: row.id,
    crmAppointmentId: row.id,
    salonId: salon?.slug || salon?.id || row.salon_id,
    salonName: salon?.name ?? "Salon",
    salonArea: salon?.city?.trim() || "India",
    services,
    date: row.appointment_date,
    time: formatSlotLabel(row.start_time),
    price,
    durationMin,
    notes: row.notes?.includes("\n")
      ? row.notes.split("\n").slice(1).join("\n").trim()
      : undefined,
    status,
    startsAt: row.starts_at ?? undefined,
    cancelNoticeHours,
    isCrmCompleted: row.status === "completed",
    hasVerifiedReview: Boolean(extras.review),
    review: extras.review,
    staffId: row.staff_id ?? undefined,
    staffName: staff?.full_name?.trim() || undefined,
    declineReason:
      extractDeclineReasonForDisplay({
        cancellationReason: row.cancellation_reason,
      }) ?? undefined,
    confirmationDeadline: row.expires_at ?? row.response_deadline ?? undefined,
    createdAt: row.created_at,
  }
}

export async function fetchCrmCustomerBookings(phone: string): Promise<Booking[]> {
  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits) return []

  const supabase = createAdminClient()

  const { data: customers } = await supabase
    .from("customers")
    .select("id")
    .eq("phone_normalized", phoneDigits)
    .is("deleted_at", null)

  const customerIds = (customers ?? []).map((row) => (row as { id: string }).id)
  if (customerIds.length === 0) return []

  const { data: rows, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .in("customer_id", customerIds)
    .is("deleted_at", null)
    .order("appointment_date", { ascending: false })
    .order("start_time", { ascending: false })

  if (error || !rows) {
    console.error("[bookings] CRM fetch failed:", error?.message)
    return []
  }

  const appointmentRows = rows as unknown as AppointmentRow[]
  const appointmentIds = appointmentRows.map((r) => r.id)

  // Load verified reviews for these appointments (for badge + card display).
  const reviewsByAppointmentId = new Map<string, BookingReview>()
  if (appointmentIds.length > 0) {
    const { data: reviewRows, error: reviewError } = await supabase
      .from("salon_reviews")
      .select("appointment_id, rating, comment, review_type")
      .eq("verified", true)
      .in("appointment_id", appointmentIds)

    if (!reviewError) {
      for (const r of (reviewRows ?? []) as Array<{
        appointment_id: string | null
        rating: number | null
        comment: string | null
        review_type: string | null
      }>) {
        if (!r.appointment_id) continue
        const rating = Number(r.rating)
        if (!Number.isFinite(rating) || rating < 1) continue
        reviewsByAppointmentId.set(r.appointment_id, {
          rating: Math.min(5, Math.max(1, Math.round(rating))),
          comment: (r.comment ?? "").trim(),
          reviewType: (r.review_type ?? "").trim() || "Overall experience",
        })
      }
    }
  }

  const serviceMap = await fetchAppointmentServices(
    supabase,
    appointmentRows.map((row) => row.id),
  )

  return appointmentRows.map((row) =>
    mapAppointmentRow(row, {
      linkedServices: serviceMap.get(row.id),
      review: reviewsByAppointmentId.get(row.id),
    }),
  )
}

/** Single appointment lookup for confirmation — no full history / expire cron. */
export async function fetchCrmCustomerBookingById(
  phone: string,
  appointmentId: string,
): Promise<Booking | undefined> {
  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits || !appointmentId) return undefined

  const supabase = createAdminClient()

  const { data: customers } = await supabase
    .from("customers")
    .select("id")
    .eq("phone_normalized", phoneDigits)
    .is("deleted_at", null)

  const customerIds = (customers ?? []).map((row) => (row as { id: string }).id)
  if (customerIds.length === 0) return undefined

  const { data: row, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .eq("id", appointmentId)
    .in("customer_id", customerIds)
    .is("deleted_at", null)
    .maybeSingle()

  if (error || !row) {
    if (error) {
      console.error("[bookings] CRM booking-by-id failed:", error.message)
    }
    return undefined
  }

  const appointment = row as unknown as AppointmentRow
  const serviceMap = await fetchAppointmentServices(supabase, [appointment.id])

  return mapAppointmentRow(appointment, {
    linkedServices: serviceMap.get(appointment.id),
  })
}
