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
  searchParams: Promise<{ services?: string; serviceId?: string; error?: string }>
}

export const metadata: Metadata = {
  title: "Book appointment",
  robots: { index: false },
}

export default async function BookPage({ params, searchParams }: Props) {
  const session = await getSession()
  if (!session) redirect("/login")

  const { salonId } = await params
  const { services, serviceId, error } = await searchParams
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
      <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <p className="section-eyebrow">Booking</p>
          <h1 className="display-section mt-3">Reserve your visit</h1>
          <p className="mt-3 text-foreground/65">
            Review your selected services, pick a date and time, and get instant confirmation saved
            to your account.
          </p>

          {error === "slot" ? (
            <p className="mt-4 rounded-xl border border-primary/30 bg-primary/8 px-4 py-3 text-sm text-foreground/80">
              That time slot was just taken. Please choose another.
            </p>
          ) : null}
          {error === "contact" ? (
            <p className="mt-4 rounded-xl border border-primary/30 bg-primary/8 px-4 py-3 text-sm text-foreground/80">
              Please enter your name, email, and a valid mobile number to continue.
            </p>
          ) : null}
          {error === "booking" ? (
            <p className="mt-4 rounded-xl border border-primary/30 bg-primary/8 px-4 py-3 text-sm text-foreground/80">
              We couldn&apos;t complete your booking. Check your details and try again.
            </p>
          ) : null}

          <BookingSalonSummary salon={salon} />
        </div>

        <div className="rounded-3xl border border-border/70 bg-white/50 p-6 sm:p-8">
          <div className="mb-8 border-b border-border/60 pb-6">
            <p className="section-eyebrow">Your appointment</p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
              Complete your service booking
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/65 sm:text-[15px]">
              Confirm your services, choose a time, and we&apos;ll save the visit to your account.
            </p>
          </div>

          <BookingForm
            salon={salon}
            initialServiceIds={initialServiceIds}
            unavailableSlots={unavailableSlots}
            bookingContext={bookingContext}
            defaultCustomerName={resolveSessionDisplayName(session.name)}
            defaultCustomerEmail={resolveSessionDisplayEmail(session.email)}
            defaultCustomerPhone={session.phone ? formatPhoneForInput(session.phone) : ""}
          />
        </div>
      </div>
    </SitePageShell>
  )
}
