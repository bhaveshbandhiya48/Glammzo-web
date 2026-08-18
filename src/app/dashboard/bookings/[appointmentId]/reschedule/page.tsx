import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, PhoneIcon } from "lucide-react"

import { RescheduleBookingForm } from "@/components/booking/reschedule-booking-form"
import { Button } from "@/components/ui/button"
import { fetchSalonBookingContextForReschedule } from "@/lib/bookings/crm/salon-context"
import {
  countDeclinedRescheduleAttempts,
  hasPendingRescheduleRequest,
  MAX_DECLINED_RESCHEDULE_ATTEMPTS,
} from "@/lib/bookings/crm/reschedule-booking"
import {
  canRescheduleWithNotice,
  CUSTOMER_RESCHEDULE_MIN_NOTICE_HOURS,
} from "@/lib/bookings/cancel-policy"
import { getSession } from "@/lib/auth/session"
import { getSalonById } from "@/lib/salons"
import { isSupabaseConfigured } from "@/lib/supabase/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"

type PageProps = {
  params: Promise<{ appointmentId: string }>
  searchParams: Promise<{ error?: string }>
}

function rescheduleErrorMessage(error: string | undefined) {
  if (error === "reschedule_slot") {
    return "That time was just taken. Please pick another slot."
  }
  if (error === "reschedule_pending") {
    return "You already have a reschedule request waiting for the salon. Please wait for their response."
  }
  if (error === "reschedule_too_soon") {
    return `Reschedules must be made at least ${CUSTOMER_RESCHEDULE_MIN_NOTICE_HOURS} hours before your appointment. Please contact the salon if you need help.`
  }
  if (error === "contact_salon") {
    return null
  }
  if (error === "reschedule") {
    return "We couldn't submit your reschedule request. Please try again or contact the salon."
  }
  return null
}

function toTelHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "")
  return digits ? `tel:${digits}` : null
}

export default async function RescheduleBookingPage({ params, searchParams }: PageProps) {
  const session = await getSession()
  if (!session?.phone) redirect("/login?next=/dashboard/profile%23bookings")

  const { appointmentId } = await params
  const { error } = await searchParams
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
      starts_at,
      duration_minutes,
      status,
      salons ( slug, id, phone, whatsapp_phone, name ),
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
    starts_at: string | null
    duration_minutes: number
    status: string
    salons:
      | {
          slug: string | null
          id: string
          phone?: string | null
          whatsapp_phone?: string | null
          name?: string | null
        }
      | {
          slug: string | null
          id: string
          phone?: string | null
          whatsapp_phone?: string | null
          name?: string | null
        }[]
      | null
    customers: { phone_normalized: string } | { phone_normalized: string }[]
  }

  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers
  if (!customer || customer.phone_normalized !== phoneDigits) notFound()

  if (row.status === "cancelled" || row.status === "completed" || row.status === "no_show") {
    redirect("/dashboard/profile?error=reschedule#bookings")
  }

  if (!canRescheduleWithNotice(row.starts_at).allowed) {
    redirect("/dashboard/profile?error=reschedule_too_soon#bookings")
  }

  const salonRelation = Array.isArray(row.salons) ? row.salons[0] : row.salons
  const salonSlug = salonRelation?.slug || salonRelation?.id || row.salon_id
  const salon = await getSalonById(salonSlug)
  if (!salon?.crmSalonId) notFound()

  const declinedCount = await countDeclinedRescheduleAttempts(row.id)
  const pendingRequest = await hasPendingRescheduleRequest(row.id)
  const mustContactSalon =
    declinedCount >= MAX_DECLINED_RESCHEDULE_ATTEMPTS || error === "contact_salon"

  const salonPhone =
    salonRelation?.whatsapp_phone?.trim() ||
    salonRelation?.phone?.trim() ||
    salon.phone?.trim() ||
    ""
  const telHref = salonPhone ? toTelHref(salonPhone) : null

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

  const errorMessage = rescheduleErrorMessage(error)

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/dashboard/profile#bookings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          Back to Your Appointments
        </Link>
        <p className="section-eyebrow mt-5">Reschedule</p>
        <h1 className="display-section mt-3">
          {mustContactSalon ? "Need help finding a suitable time?" : "Pick a new time"}
        </h1>
        <p className="mt-2 text-sm text-foreground/65">
          {mustContactSalon
            ? `The salon has declined your previous requests. Please contact ${salon.name} to find an available time.`
            : pendingRequest
              ? `You already have a reschedule request waiting for ${salon.name}. Please wait for their response.`
              : `Choose another slot for your appointment at ${salon.name}. The salon will confirm your request.`}
        </p>
      </div>

      {mustContactSalon ? (
        <div className="space-y-4 rounded-2xl border border-border/65 bg-card p-5 shadow-sm shadow-black/[0.03] sm:p-6">
          <p className="text-sm leading-relaxed text-foreground/75">
            Your original appointment remains as scheduled until you and the salon agree on a new
            time.
          </p>
          {telHref ? (
            <Button asChild className="w-full gap-2 sm:w-auto">
              <a href={telHref}>
                <PhoneIcon className="size-4" />
                Call {salonPhone}
              </a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Salon phone number isn&apos;t available here. Please reach them through Glammzo
              messaging or visit the salon page.
            </p>
          )}
        </div>
      ) : pendingRequest ? (
        <div className="rounded-2xl border border-amber-600/25 bg-amber-50 px-4 py-3.5 text-sm text-amber-950/90">
          Your reschedule request is with the salon. You&apos;ll get a WhatsApp update when they
          accept or decline.
        </div>
      ) : (
        <>
          {errorMessage ? (
            <div
              role="alert"
              className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3.5 text-sm text-destructive/90"
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="rounded-2xl border border-border/65 bg-card p-5 shadow-sm shadow-black/[0.03] sm:p-6">
            <RescheduleBookingForm
              appointmentId={row.id}
              salonName={salon.name}
              serviceIds={serviceIds}
              durationMin={row.duration_minutes}
              bookingContext={bookingContext}
              currentDate={row.appointment_date}
            />
          </div>
        </>
      )}
    </div>
  )
}
