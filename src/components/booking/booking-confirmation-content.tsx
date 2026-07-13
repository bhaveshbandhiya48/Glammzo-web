import Link from "next/link"
import {
  CalendarIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react"

import { BookingStatusBadge } from "@/components/booking/booking-status-badge"
import { Button } from "@/components/ui/button"
import { formatBookingDate, formatDuration } from "@/lib/bookings/utils"
import { formatInr } from "@/lib/salons/catalog-utils"
import type { Booking } from "@/types/booking"
import { cn } from "@/lib/utils"

type BookingConfirmationContentProps = {
  booking: Booking
}

const VISIBLE_SERVICE_COUNT = 3

const PENDING_STEPS = [
  "The salon reviews your request and checks availability.",
  "You'll see the status update in your appointments.",
  "Once confirmed, your visit details stay saved here.",
] as const

export function BookingConfirmationContent({ booking }: BookingConfirmationContentProps) {
  const isPending = booking.status === "pending"
  const primaryServices = booking.services.slice(0, VISIBLE_SERVICE_COUNT)
  const hiddenServices = booking.services.slice(VISIBLE_SERVICE_COUNT)
  const hasHiddenServices = hiddenServices.length > 0

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center text-center">
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-full border shadow-sm",
          isPending
            ? "border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700"
            : "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-primary/10 text-emerald-700",
        )}
      >
        {isPending ? (
          <CalendarClockIcon className="size-8" strokeWidth={1.75} />
        ) : (
          <CheckCircle2Icon className="size-8" strokeWidth={1.75} />
        )}
      </div>

      <h1 className="display-section mt-6 text-balance">
        {isPending ? "Request sent to the salon" : "You're all set"}
      </h1>
      <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-foreground/65 sm:text-base">
        {isPending
          ? "The salon will review your request and confirm shortly. We'll update your appointments once they respond."
          : "Your appointment is confirmed. We've saved the details to your account."}
      </p>

      <div className="mt-4">
        <BookingStatusBadge status={booking.status} />
      </div>

      {isPending ? (
        <div className="mt-8 w-full rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 text-left">
          <p className="text-xs font-semibold tracking-[0.14em] text-amber-900/70 uppercase">
            What happens next
          </p>
          <ol className="mt-3 space-y-3">
            {PENDING_STEPS.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-amber-950/80">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="mt-8 w-full overflow-hidden rounded-3xl border border-border/70 bg-card text-left shadow-lg shadow-black/[0.04]">
        <div className="border-b border-border/60 bg-muted/20 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                Salon
              </p>
              <p className="mt-1 font-heading text-xl font-semibold leading-snug text-foreground">
                {booking.salonName}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground/60">
                <MapPinIcon className="size-3.5 shrink-0" />
                {booking.salonArea}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
              <Link href={`/salons/${booking.salonId}`}>View salon</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3.5">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/50">
              <CalendarIcon className="size-3.5" />
              Date
            </p>
            <p className="mt-1.5 font-medium leading-snug text-foreground">
              {formatBookingDate(booking.date)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3.5">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/50">
              <ClockIcon className="size-3.5" />
              Time
            </p>
            <p className="mt-1.5 font-medium leading-snug text-foreground">{booking.time}</p>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          {booking.staffName ? (
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-foreground/45 uppercase">
                <UserIcon className="size-3.5" />
                Stylist
              </p>
              <p className="mt-1.5 text-sm font-medium text-foreground">{booking.staffName}</p>
            </div>
          ) : null}

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-foreground/45 uppercase">
                <SparklesIcon className="size-3.5" />
                Service{booking.services.length === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-foreground/50">
                {booking.services.length} item{booking.services.length === 1 ? "" : "s"} · ~
                {formatDuration(booking.durationMin)}
              </p>
            </div>

            <ul className="mt-3 divide-y divide-border/50 overflow-hidden rounded-xl border border-border/60 bg-background/50">
              {primaryServices.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate font-medium text-foreground">{service.name}</span>
                  <span className="shrink-0 text-xs text-foreground/55 tabular-nums">
                    {formatInr(service.price)} · {service.durationMin} min
                  </span>
                </li>
              ))}

              {hasHiddenServices ? (
                <li className="px-3.5 py-1">
                  <details className="group">
                    <summary className="cursor-pointer list-none py-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 [&::-webkit-details-marker]:hidden">
                      <span className="group-open:hidden">
                        +{hiddenServices.length} more service
                        {hiddenServices.length === 1 ? "" : "s"}
                      </span>
                      <span className="hidden group-open:inline">Hide extra services</span>
                    </summary>
                    <ul className="divide-y divide-border/50 border-t border-border/50">
                      {hiddenServices.map((service) => (
                        <li
                          key={service.id}
                          className="flex items-center justify-between gap-3 py-2.5 text-sm"
                        >
                          <span className="min-w-0 truncate font-medium text-foreground">
                            {service.name}
                          </span>
                          <span className="shrink-0 text-xs text-foreground/55 tabular-nums">
                            {formatInr(service.price)} · {service.durationMin} min
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : null}
            </ul>
          </div>

          {booking.notes ? (
            <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-3.5">
              <p className="text-xs font-semibold tracking-[0.12em] text-foreground/45 uppercase">
                Your notes
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">{booking.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-border/60 bg-muted/15 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-foreground/45 uppercase">
              Estimated total
            </p>
            <p className="mt-1 text-xs text-foreground/50">Pay at the salon unless stated otherwise</p>
          </div>
          <p className="font-heading text-2xl font-semibold tabular-nums text-foreground">
            {formatInr(booking.price)}
          </p>
        </div>
      </div>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="w-full rounded-full sm:w-auto sm:min-w-[11rem]">
          <Link href="/dashboard/bookings">Manage booking</Link>
        </Button>
        <Button asChild variant="outline" className="w-full rounded-full sm:w-auto sm:min-w-[11rem]">
          <Link href="/explore">Book another</Link>
        </Button>
      </div>

      <p className="mt-5 text-xs text-foreground/45">
        Reference · {booking.id.slice(0, 8).toUpperCase()}
      </p>
    </div>
  )
}
