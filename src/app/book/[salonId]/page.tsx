import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { BookingSalonSummary } from "@/components/booking/booking-salon-summary"
import { BookingForm } from "@/components/booking/booking-form"
import { SitePageShell } from "@/components/layout/site-page-shell"
import { resolveSessionDisplayEmail, resolveSessionDisplayName } from "@/lib/auth/display"
import { getSession } from "@/lib/auth/session"
import { fetchSalonBookingContext } from "@/lib/bookings/crm/salon-context"
import { parseServiceIds } from "@/lib/bookings/utils"
import { formatPhoneForInput } from "@/lib/phone/display"
import { getSalonById } from "@/lib/salons"
import { isSupabaseConfigured } from "@/lib/supabase/admin"

type Props = {
  params: Promise<{ salonId: string }>
  searchParams: Promise<{
    services?: string
    serviceId?: string
    package?: string
    promo?: string
    error?: string
  }>
}

export const metadata: Metadata = {
  title: "Book appointment",
  robots: { index: false },
}

export default async function BookPage({ params, searchParams }: Props) {
  const session = await getSession()
  if (!session) redirect("/login")

  const { salonId } = await params
  const { services, serviceId, package: packageId, promo, error } = await searchParams
  const salon = await getSalonById(salonId)
  if (!salon) notFound()

  const initialServiceIds = parseServiceIds(services ?? serviceId ?? "")

  const useCrm = isSupabaseConfigured() && Boolean(salon.crmSalonId)
  const bookingContext = useCrm
    ? await fetchSalonBookingContext(salon.crmSalonId!)
    : null

  const unavailableSlots: { date: string; time: string }[] = []

  return (
    <SitePageShell>
      <div className="grid items-start gap-6 lg:gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <p className="section-eyebrow">Booking</p>
          <h1 className="display-section mt-2">Reserve your visit</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            What you&apos;re booking, when, and how much you&apos;ll pay — then confirm in one step.
          </p>

          {error === "slot" ? (
            <p className="mt-3 rounded-xl border border-primary/30 bg-primary/8 px-3 py-2.5 text-sm">
              That time slot was just taken. Please choose another.
            </p>
          ) : null}
          {error === "contact" ? (
            <p className="mt-3 rounded-xl border border-primary/30 bg-primary/8 px-3 py-2.5 text-sm">
              Please enter your name, email, and a valid mobile number to continue.
            </p>
          ) : null}
          {error === "booking" ? (
            <p className="mt-3 rounded-xl border border-primary/30 bg-primary/8 px-3 py-2.5 text-sm">
              We couldn&apos;t complete your booking. Check your details and try again.
            </p>
          ) : null}
          {error === "promo" ? (
            <p className="mt-3 rounded-xl border border-primary/30 bg-primary/8 px-3 py-2.5 text-sm">
              That promo code could not be applied. Check the code and your selected services, then
              try again.
            </p>
          ) : null}

          <BookingSalonSummary salon={salon} />
        </div>

        <div className="min-w-0">
          <BookingForm
            salon={salon}
            initialServiceIds={initialServiceIds}
            initialPackageId={packageId ?? null}
            unavailableSlots={unavailableSlots}
            bookingContext={bookingContext}
            defaultCustomerName={resolveSessionDisplayName(session.name)}
            defaultCustomerEmail={resolveSessionDisplayEmail(session.email)}
            defaultCustomerPhone={session.phone ? formatPhoneForInput(session.phone) : ""}
            initialPromoCode={promo ?? ""}
          />
        </div>
      </div>
    </SitePageShell>
  )
}
