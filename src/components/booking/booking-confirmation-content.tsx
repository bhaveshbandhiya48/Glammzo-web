"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
} from "lucide-react"

import { BookingStatusBadge } from "@/components/booking/booking-status-badge"
import { BookingSuccessConfetti } from "@/components/booking/booking-success-confetti"
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
  "The salon will review your booking.",
  "You'll receive confirmation once they respond.",
  "Your appointment details will remain available in your bookings.",
] as const

const easeOut = [0.22, 1, 0.36, 1] as const

export function BookingConfirmationContent({ booking }: BookingConfirmationContentProps) {
  const isPending = booking.status === "pending"
  const primaryServices = booking.services.slice(0, VISIBLE_SERVICE_COUNT)
  const hiddenServices = booking.services.slice(VISIBLE_SERVICE_COUNT)
  const hasHiddenServices = hiddenServices.length > 0
  const bookingReference = booking.id.slice(0, 8).toUpperCase()

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col items-center">
      <BookingSuccessConfetti />

      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeOut }}
        className="flex w-full flex-col items-center text-center"
      >
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-full border shadow-sm",
            isPending
              ? "border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50/80 text-amber-700"
              : "border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-primary/10 text-emerald-700",
          )}
          aria-hidden
        >
          <CheckCircle2Icon className="size-7" strokeWidth={1.75} />
        </div>

        <h1 className="mt-5 font-heading text-[clamp(1.5rem,4vw,1.85rem)] font-semibold tracking-tight text-balance">
          {isPending ? "Booking Request Sent" : "You're all set"}
        </h1>

        <p className="mt-2.5 max-w-sm text-pretty text-sm leading-relaxed text-foreground/60 sm:text-[0.95rem]">
          {isPending
            ? "Your booking request has been sent successfully. The salon will review your request and confirm it shortly."
            : "Your appointment is confirmed. We've saved the details to your account."}
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.12, ease: easeOut }}
          className="mt-4"
        >
          <BookingStatusBadge
            status={booking.status}
            className={cn(
              "h-7 px-3.5 text-[0.7rem] font-semibold tracking-[0.04em]",
              isPending && "border border-amber-200/80 bg-amber-50 text-amber-900",
            )}
          />
        </motion.div>
      </motion.header>

      {isPending ? (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: easeOut }}
          className="mt-7 w-full rounded-2xl border border-border/60 bg-card/80 px-5 py-4 text-left shadow-sm shadow-black/[0.03]"
          aria-labelledby="confirmation-next-steps"
        >
          <h2
            id="confirmation-next-steps"
            className="text-xs font-semibold tracking-[0.12em] text-foreground/45 uppercase"
          >
            What Happens Next
          </h2>
          <ul className="mt-3 space-y-2">
            {PENDING_STEPS.map((step) => (
              <li
                key={step}
                className="flex gap-2.5 text-sm leading-relaxed text-foreground/70"
              >
                <span
                  className="mt-2 size-1 shrink-0 rounded-full bg-foreground/35"
                  aria-hidden
                />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      ) : null}

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16, ease: easeOut }}
        className="mt-6 w-full overflow-hidden rounded-2xl border border-border/65 bg-card text-left shadow-md shadow-black/[0.04]"
        aria-labelledby="confirmation-summary-heading"
      >
        <h2 id="confirmation-summary-heading" className="sr-only">
          Appointment summary
        </h2>

        <div className="border-b border-border/55 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-foreground/40 uppercase">
                Salon
              </p>
              <p className="mt-1 font-heading text-lg font-semibold leading-snug text-foreground sm:text-xl">
                {booking.salonName}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground/55">
                <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
                {booking.salonArea}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
              <Link href={`/salons/${booking.salonId}`}>View salon</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border/55 border-b border-border/55">
          <div className="px-5 py-3.5 sm:px-6">
            <p className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
              <CalendarIcon className="size-3" aria-hidden />
              Date
            </p>
            <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">
              {formatBookingDate(booking.date)}
            </p>
          </div>
          <div className="px-5 py-3.5 sm:px-6">
            <p className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
              <ClockIcon className="size-3" aria-hidden />
              Time
            </p>
            <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">
              {booking.time}
            </p>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4 sm:px-6">
          {booking.staffName ? (
            <div>
              <p className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
                <UserIcon className="size-3" aria-hidden />
                Stylist
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{booking.staffName}</p>
            </div>
          ) : null}

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
                Service{booking.services.length === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-foreground/45">
                {booking.services.length} · ~{formatDuration(booking.durationMin)}
              </p>
            </div>

            <ul className="mt-2.5 divide-y divide-border/45">
              {primaryServices.map((service) => (
                <li
                  key={service.id}
                  className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {service.name}
                    </p>
                    <p className="mt-0.5 text-xs text-foreground/45">
                      {service.durationMin} min
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium tabular-nums text-foreground/80">
                    {formatInr(service.price)}
                  </p>
                </li>
              ))}

              {hasHiddenServices ? (
                <li className="pt-1">
                  <details className="group">
                    <summary className="cursor-pointer list-none py-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                      <span className="group-open:hidden">
                        +{hiddenServices.length} more service
                        {hiddenServices.length === 1 ? "" : "s"}
                      </span>
                      <span className="hidden group-open:inline">Hide extra services</span>
                    </summary>
                    <ul className="divide-y divide-border/45 border-t border-border/45">
                      {hiddenServices.map((service) => (
                        <li
                          key={service.id}
                          className="flex items-start justify-between gap-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {service.name}
                            </p>
                            <p className="mt-0.5 text-xs text-foreground/45">
                              {service.durationMin} min
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-medium tabular-nums text-foreground/80">
                            {formatInr(service.price)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : null}
            </ul>
          </div>

          {booking.notes ? (
            <div className="rounded-xl bg-muted/35 px-3.5 py-3">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
                Your notes
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/70">{booking.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-border/55 bg-muted/20 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
              Estimated Total
            </p>
            <p className="mt-1 text-xs text-foreground/50">
              Pay at salon unless stated otherwise
            </p>
          </div>
          <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {formatInr(booking.price)}
          </p>
        </div>

        <div className="border-t border-border/55 px-5 py-3.5 sm:px-6">
          <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-foreground/40 uppercase">
            Booking Reference
          </p>
          <p className="mt-1 font-heading text-sm font-semibold tracking-wide text-foreground/80">
            #{bookingReference}
          </p>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.28, ease: easeOut }}
        className="mt-7 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center sm:gap-3"
      >
        <Button
          asChild
          size="lg"
          className="w-full rounded-full sm:w-auto sm:min-w-[11.5rem]"
        >
          <Link href="/dashboard/bookings">Manage Booking</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full rounded-full sm:w-auto sm:min-w-[11.5rem]"
        >
          <Link href="/explore">Book Another</Link>
        </Button>
      </motion.div>
    </div>
  )
}
