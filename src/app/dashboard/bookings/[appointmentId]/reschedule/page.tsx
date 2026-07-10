import { notFound, redirect } from "next/navigation"

import { RescheduleBookingForm } from "@/components/booking/reschedule-booking-form"
import { SitePageShell } from "@/components/layout/site-page-shell"
import { fetchSalonBookingContextForReschedule } from "@/lib/bookings/crm/salon-context"
import { getSession } from "@/lib/auth/session"
import { getSalonById } from "@/lib/salons"
import { isSupabaseConfigured } from "@/lib/supabase/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"

type PageProps = {
  params: Promise<{ appointmentId: string }>
}

export default async function RescheduleBookingPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.phone) redirect("/login?next=/dashboard/bookings")

  const { appointmentId } = await params
  if (!isSupabaseConfigured()) notFound()

  const phoneDigits = normalizeCustomerPhoneDigits(session.phone)
  const supabase = createAdminClient()

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `
      id,
      salon_id,
      appointment_date,
      start_time,
      duration_minutes,
      status,
      salons ( slug, id ),
      customers!inner(phone_normalized)
    `,
    )
    .eq("id", appointmentId)
    .is("deleted_at", null)
    .maybeSingle()

  if (!appointment) notFound()

  const row = appointment as unknown as {
    id: string
    salon_id: string
    appointment_date: string
    start_time: string
    duration_minutes: number
    status: string
    salons: { slug: string | null; id: string } | { slug: string | null; id: string }[] | null
    customers: { phone_normalized: string } | { phone_normalized: string }[]
  }

  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers
  if (!customer || customer.phone_normalized !== phoneDigits) notFound()

  if (row.status === "cancelled" || row.status === "completed" || row.status === "no_show") {
    redirect("/dashboard/bookings?error=reschedule")
  }

  const salonRelation = Array.isArray(row.salons) ? row.salons[0] : row.salons
  const salonSlug = salonRelation?.slug || salonRelation?.id || row.salon_id
  const salon = await getSalonById(salonSlug)
  if (!salon?.crmSalonId) notFound()

  const { data: serviceRows } = await supabase
    .from("appointment_services")
    .select("service_id")
    .eq("appointment_id", row.id)
    .order("sort_order", { ascending: true })

  const serviceIds = (serviceRows ?? []).map((item) => (item as { service_id: string }).service_id)
  if (serviceIds.length === 0) notFound()

  const bookingContext = await fetchSalonBookingContextForReschedule(
    salon.crmSalonId,
    row.id,
  )
  if (!bookingContext) notFound()

  return (
    <SitePageShell>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <p className="section-eyebrow">Reschedule</p>
          <h1 className="display-section mt-3">Pick a new time</h1>
          <p className="mt-2 text-sm text-foreground/65">
            Choose another slot for your appointment at {salon.name}.
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-white/50 p-6 sm:p-8">
          <RescheduleBookingForm
            appointmentId={row.id}
            salonName={salon.name}
            serviceIds={serviceIds}
            durationMin={row.duration_minutes}
            bookingContext={bookingContext}
            currentDate={row.appointment_date}
          />
        </div>
      </div>
    </SitePageShell>
  )
}
