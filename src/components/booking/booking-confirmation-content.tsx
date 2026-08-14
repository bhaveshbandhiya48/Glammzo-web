"use client"

import { useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  ClockIcon,
  MapPinIcon,
  MessageCircleIcon,
  SparklesIcon,
  TicketIcon,
  UserIcon,
  WalletIcon,
  XCircleIcon,
} from "lucide-react"

import { BookingStatusBadge } from "@/components/booking/booking-status-badge"
import { BookingPriceBreakdownCard } from "@/components/booking/booking-price-breakdown"
import { BookingSuccessConfetti } from "@/components/booking/booking-success-confetti"
import { Button } from "@/components/ui/button"
import {
  formatBookingDate,
  formatBookingNotesForDisplay,
  formatDuration,
  hasPayAtSalonNote,
  parseBookingPriceBreakdown,
} from "@/lib/bookings/utils"
import { formatInr } from "@/lib/salons/catalog-utils"
import type { Booking, BookingStatus } from "@/types/booking"
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

const PENDING_STEP_ICONS = [ClipboardCheckIcon, CheckCircle2Icon, TicketIcon] as const

const easeOut = [0.22, 1, 0.36, 1] as const

const cardChrome =
  "flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.08)]"

type ConfirmationTone = "pending" | "success" | "negative"

function getConfirmationTone(status: BookingStatus): ConfirmationTone {
  if (status === "pending") return "pending"
  if (status === "declined" || status === "expired" || status === "cancelled") {
    return "negative"
  }
  return "success"
}

function getConfirmationCopy(booking: Booking) {
  const nearManualWindow =
    booking.status === "pending" &&
    Boolean(booking.confirmationDeadline) &&
    new Date(booking.confirmationDeadline!).getTime() -
      new Date(booking.createdAt).getTime() <=
      20 * 60_000

  switch (booking.status) {
    case "pending":
      return {
        title: "Booking Request Sent",
        description: nearManualWindow
          ? "Your booking request has been sent. The salon usually responds within about 15 minutes."
          : "Your booking request has been sent successfully. The salon will review your request and confirm it shortly.",
        panelTitle: "What happens next",
        panelBody: null as string | null,
        footerHint:
          "Need to change your appointment? You can cancel or reschedule once the salon confirms your booking.",
      }
    case "expired":
      return {
        title: "Request expired",
        description:
          "The salon didn’t confirm this booking in time, so the request expired and the slot was released.",
        panelTitle: "What this means",
        panelBody:
          "You can book another time on Glammzo. Your booking history still shows this expired request.",
        footerHint: "Browse the salon again anytime to pick a new slot.",
      }
    case "declined":
      return {
        title: "Request not accepted",
        description:
          booking.declineReason?.trim()
            ? `The salon could not accept this booking. Reason: ${booking.declineReason.trim()}`
            : "The salon could not accept this booking request.",
        panelTitle: "What this means",
        panelBody:
          "The time slot is no longer held for you. You can book another time on Glammzo.",
        footerHint: "Browse the salon again anytime to pick a new slot.",
      }
    case "cancelled":
      return {
        title: "Booking cancelled",
        description: "This appointment has been cancelled.",
        panelTitle: "Next steps",
        panelBody: "You can book another visit whenever you’re ready.",
        footerHint: "Need a new appointment? Book another time from Explore.",
      }
    default:
      return {
        title: "You're all set",
        description:
          "Your appointment is confirmed. We've saved the details to your account.",
        panelTitle: "You’re confirmed",
        panelBody:
          "Show this booking at the salon. You can manage or cancel from your bookings anytime.",
        footerHint:
          "Need to change your appointment? You can cancel or reschedule from Manage Booking.",
      }
  }
}

export function BookingConfirmationContent({ booking }: BookingConfirmationContentProps) {
  const tone = getConfirmationTone(booking.status)
  const copy = getConfirmationCopy(booking)
  const isPending = tone === "pending"
  const isNegative = tone === "negative"
  const primaryServices = booking.services.slice(0, VISIBLE_SERVICE_COUNT)
  const hiddenServices = booking.services.slice(VISIBLE_SERVICE_COUNT)
  const hasHiddenServices = hiddenServices.length > 0
  const bookingReference = booking.id.slice(0, 8).toUpperCase()
  const StatusIcon = isNegative ? XCircleIcon : CheckCircle2Icon
  const isCompleted =
    Boolean(booking.isCrmCompleted) || booking.status === "completed"
  const displayNotes = formatBookingNotesForDisplay(booking.notes)
  const breakdown = parseBookingPriceBreakdown(booking)
  const showSalonPaymentLabel =
    hasPayAtSalonNote(booking.notes) || isCompleted || !isNegative || breakdown.hasAdjustments
  const salonPaymentLabel = isCompleted ? "Paid at salon" : "Pay at salon"
  const showWhatsAppReminder =
    booking.status === "confirmed" || booking.status === "upcoming"

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col">
      {tone === "success" || isPending ? <BookingSuccessConfetti /> : null}

      {/*
        On mobile, confirmation status stacks first (order-1). On desktop,
        appointment summary stays in the left column.
      */}
      <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Appointment pass — second on mobile, left column on desktop */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: easeOut }}
          className={cn(
            cardChrome,
            "order-2 mx-auto w-full max-w-lg lg:order-1 lg:mx-0 lg:max-w-none",
          )}
          aria-labelledby="confirmation-summary-heading"
        >
          <h2 id="confirmation-summary-heading" className="sr-only">
            Appointment summary
          </h2>

          {/* Salon */}
          <div className="border-b border-border/50 px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-foreground/40 uppercase">
                  Salon
                </p>
                <p className="mt-2 font-heading text-[1.35rem] font-semibold leading-snug tracking-tight text-foreground sm:text-[1.5rem]">
                  {booking.salonName}
                </p>
                <p className="mt-2.5 inline-flex items-center gap-2 text-sm text-foreground/55">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted/70 text-foreground/50">
                    <MapPinIcon className="size-3.5" aria-hidden />
                  </span>
                  {booking.salonArea}
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full border-border/70 bg-background/80 transition-all hover:border-foreground/20 hover:bg-muted/50"
              >
                <Link href={`/salons/${booking.salonId}`}>View salon</Link>
              </Button>
            </div>
          </div>

          {/* Appointment meta */}
          <div className="grid grid-cols-2 gap-0 border-b border-border/50">
            <div className="border-r border-border/50 px-6 py-5 sm:px-8">
              <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.14em] text-foreground/40 uppercase">
                <CalendarIcon className="size-3.5 text-primary/70" aria-hidden />
                Date
              </p>
              <p className="mt-2.5 text-[0.95rem] font-semibold leading-snug text-foreground">
                {formatBookingDate(booking.date)}
              </p>
            </div>
            <div className="px-6 py-5 sm:px-8">
              <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.14em] text-foreground/40 uppercase">
                <ClockIcon className="size-3.5 text-primary/70" aria-hidden />
                Time
              </p>
              <p className="mt-2.5 text-[0.95rem] font-semibold leading-snug text-foreground">
                {booking.time}
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-6 px-6 py-6 sm:px-8 sm:py-7">
            {booking.staffName ? (
              <div>
                <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.14em] text-foreground/40 uppercase">
                  <UserIcon className="size-3.5 text-primary/70" aria-hidden />
                  Stylist
                </p>
                <p className="mt-2 text-[0.95rem] font-semibold text-foreground">
                  {booking.staffName}
                </p>
              </div>
            ) : null}

            {/* Services */}
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.14em] text-foreground/40 uppercase">
                  <SparklesIcon className="size-3.5 text-primary/70" aria-hidden />
                  Service{booking.services.length === 1 ? "" : "s"}
                </p>
                <p className="text-xs font-medium text-foreground/45">
                  {booking.services.length} · ~{formatDuration(booking.durationMin)}
                </p>
              </div>

              <ul className="mt-3 divide-y divide-border/40">
                {primaryServices.map((service) => (
                  <li
                    key={service.id}
                    className="flex items-start justify-between gap-4 py-3.5 first:pt-1 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {service.name}
                      </p>
                      <p className="mt-1 text-xs text-foreground/45">
                        {service.durationMin} min
                      </p>
                    </div>
                    <p
                      className={cn(
                        "shrink-0 text-sm tabular-nums",
                        breakdown.hasAdjustments
                          ? "font-medium text-foreground/45"
                          : "font-semibold text-foreground/75",
                      )}
                    >
                      {formatInr(service.price)}
                    </p>
                  </li>
                ))}

                {hasHiddenServices ? (
                  <li className="pt-1">
                    <details className="group">
                      <summary className="cursor-pointer list-none py-2.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                        <span className="group-open:hidden">
                          +{hiddenServices.length} more service
                          {hiddenServices.length === 1 ? "" : "s"}
                        </span>
                        <span className="hidden group-open:inline">Hide extra services</span>
                      </summary>
                      <ul className="divide-y divide-border/40 border-t border-border/40">
                        {hiddenServices.map((service) => (
                          <li
                            key={service.id}
                            className="flex items-start justify-between gap-4 py-3.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {service.name}
                              </p>
                              <p className="mt-1 text-xs text-foreground/45">
                                {service.durationMin} min
                              </p>
                            </div>
                            <p
                              className={cn(
                                "shrink-0 text-sm tabular-nums",
                                breakdown.hasAdjustments
                                  ? "font-medium text-foreground/45"
                                  : "font-semibold text-foreground/75",
                              )}
                            >
                              {formatInr(service.price)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ) : null}
              </ul>
              {breakdown.hasAdjustments ? (
                <p className="mt-2 text-xs text-foreground/45">
                  Service prices are before promo and wallet. See payment summary for what you pay.
                </p>
              ) : null}
            </div>

            {displayNotes ? (
              <div className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-3.5">
                <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-foreground/40 uppercase">
                  Your notes
                </p>
                <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-foreground/70">
                  {displayNotes}
                </p>
              </div>
            ) : null}
          </div>

          {/* Payment + reference */}
          <div className="mt-auto border-t border-border/50 bg-gradient-to-b from-muted/25 to-muted/40 px-6 py-6 sm:px-8">
            <p className="mb-3 inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.14em] text-foreground/40 uppercase">
              <WalletIcon className="size-3.5 text-primary/70" aria-hidden />
              Payment summary
            </p>
            <BookingPriceBreakdownCard
              breakdown={breakdown}
              payableLabel={showSalonPaymentLabel ? salonPaymentLabel : undefined}
            />

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/45 pt-5">
              <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.14em] text-foreground/40 uppercase">
                <TicketIcon className="size-3.5 text-primary/70" aria-hidden />
                Booking ID
              </p>
              <span className="inline-flex items-center rounded-full border border-border/70 bg-white px-3 py-1 font-heading text-xs font-semibold tracking-wider text-foreground/80 shadow-sm shadow-black/[0.03]">
                #{bookingReference}
              </span>
            </div>
          </div>
        </motion.section>

        {/* Success / next steps — first on mobile, right column on desktop */}
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: easeOut }}
          className={cn(
            cardChrome,
            "order-1 mx-auto w-full max-w-lg lg:order-2 lg:mx-0 lg:max-w-none",
          )}
        >
          <div className="flex flex-1 flex-col px-6 py-7 sm:px-8 sm:py-8">
            <header className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.18, ease: easeOut }}
                className="relative"
              >
                <div
                  className={cn(
                    "absolute inset-0 -m-4 rounded-full opacity-70 blur-2xl",
                    isPending && "bg-gradient-to-br from-amber-200/50 to-orange-100/40",
                    tone === "success" &&
                      "bg-gradient-to-br from-emerald-200/50 to-primary/15",
                    isNegative && "bg-gradient-to-br from-orange-200/45 to-red-100/35",
                  )}
                  aria-hidden
                />
                <div
                  className={cn(
                    "relative flex size-16 items-center justify-center rounded-full border shadow-sm sm:size-[4.5rem]",
                    isPending &&
                      "border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700",
                    tone === "success" &&
                      "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-primary/10 text-emerald-700",
                    isNegative &&
                      "border-orange-200/80 bg-gradient-to-br from-orange-50 to-red-50 text-orange-800",
                  )}
                  aria-hidden
                >
                  <StatusIcon className="size-8 sm:size-9" strokeWidth={1.75} />
                  {tone === "success" ? (
                    <SparklesIcon
                      className="absolute -top-0.5 -right-0.5 size-3.5 text-primary/70"
                      aria-hidden
                    />
                  ) : null}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.24, ease: easeOut }}
                className="mt-5"
              >
                <BookingStatusBadge
                  status={booking.status}
                  className="h-9 px-4 text-[0.8125rem] shadow-md"
                />
              </motion.div>

              <h1 className="mt-5 font-heading text-[clamp(1.55rem,3.6vw,1.95rem)] font-semibold tracking-tight text-balance text-foreground">
                {copy.title}
              </h1>

              <p className="mt-3 max-w-sm text-pretty text-sm leading-relaxed text-foreground/55 sm:text-[0.95rem]">
                {copy.description}
              </p>
            </header>

            {isPending ? (
              <section
                className="mt-8 text-left"
                aria-labelledby="confirmation-next-steps"
              >
                <h2
                  id="confirmation-next-steps"
                  className="text-center text-[0.68rem] font-semibold tracking-[0.16em] text-foreground/40 uppercase"
                >
                  {copy.panelTitle}
                </h2>

                <ol className="relative mt-5 space-y-0">
                  {PENDING_STEPS.map((step, index) => {
                    const Icon = PENDING_STEP_ICONS[index] ?? CheckCircle2Icon
                    const isLast = index === PENDING_STEPS.length - 1

                    return (
                      <li key={step} className="relative flex gap-3.5 pb-5 last:pb-0">
                        {!isLast ? (
                          <span
                            className="absolute top-9 left-[1.05rem] h-[calc(100%-1.35rem)] w-px bg-border/70"
                            aria-hidden
                          />
                        ) : null}
                        <span className="relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-primary shadow-sm shadow-black/[0.02]">
                          <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1 rounded-2xl border border-border/55 bg-muted/20 px-3.5 py-3">
                          <p className="text-sm leading-relaxed font-medium text-foreground/75">
                            {step}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </section>
            ) : (
              <section
                className={cn(
                  "mt-8 rounded-2xl border px-5 py-5 text-center",
                  tone === "success" && "border-emerald-200/60 bg-emerald-50/50",
                  isNegative && "border-orange-200/70 bg-orange-50/45",
                )}
              >
                <h2
                  className={cn(
                    "text-[0.68rem] font-semibold tracking-[0.16em] uppercase",
                    tone === "success" && "text-emerald-800/70",
                    isNegative && "text-orange-900/70",
                  )}
                >
                  {copy.panelTitle}
                </h2>
                {copy.panelBody ? (
                  <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                    {copy.panelBody}
                  </p>
                ) : null}
                {showWhatsAppReminder ? (
                  <div className="mt-4 flex items-center justify-center gap-2 border-t border-emerald-200/60 pt-4 text-sm text-emerald-900/75">
                    <MessageCircleIcon className="size-4 shrink-0" aria-hidden />
                    <p>
                      You’ll receive a WhatsApp reminder 1 hour before your appointment.
                    </p>
                  </div>
                ) : null}
              </section>
            )}

            <div className="mt-auto flex flex-col gap-3 pt-8">
              <Button
                asChild
                size="lg"
                className="h-12 w-full rounded-full text-[0.95rem] shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
              >
                <Link href="/dashboard/profile#bookings">Manage Booking</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-12 w-full rounded-full text-[0.95rem] text-foreground/70 transition-all hover:bg-muted/60 hover:text-foreground"
              >
                <Link href={isNegative ? `/salons/${booking.salonId}` : "/explore"}>
                  {isNegative ? "Book again" : "Book Another"}
                </Link>
              </Button>

              <p className="mt-2 px-2 text-center text-[0.78rem] leading-relaxed text-foreground/40">
                {copy.footerHint}
              </p>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
