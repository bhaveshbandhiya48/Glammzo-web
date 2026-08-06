"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  TimerIcon,
  UserIcon,
} from "lucide-react"

import { BookingStatusBadge } from "@/components/booking/booking-status-badge"
import { BookingOrderSummary } from "@/components/booking/booking-order-summary"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  formatBookingDate,
  formatDuration,
  parseBookingPriceBreakdown,
} from "@/lib/bookings/utils"
import { formatInr } from "@/lib/salons/catalog-utils"
import type { Booking } from "@/types/booking"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

type AppointmentCardProps = {
  booking: Booking
  authenticated: boolean
  index?: number
}

const easeOut = [0.22, 1, 0.36, 1] as const

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarIcon
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border/60 bg-background/70 px-3 py-2.5">
      <p className="inline-flex items-center gap-1 text-[0.65rem] font-semibold tracking-[0.1em] text-foreground/40 uppercase">
        <Icon className="size-3 shrink-0" aria-hidden />
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

export function AppointmentCard({ booking, authenticated, index = 0 }: AppointmentCardProps) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const breakdown = parseBookingPriceBreakdown(booking)
  const serviceCount = booking.services.length
  const serviceSummary =
    serviceCount === 1
      ? booking.services[0]?.name ?? "1 service"
      : `${serviceCount} services`

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: Math.min(index * 0.04, 0.16), ease: easeOut }}
        className={cn(
          "overflow-hidden rounded-xl border border-border/65 bg-card shadow-sm shadow-black/[0.03]",
          "transition-[box-shadow,border-color] duration-200 ease-out",
          "hover:border-border hover:shadow-md hover:shadow-black/[0.05]",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"
        >
          <header className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-3 sm:px-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                <h3 className="min-w-0 font-heading text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
                  {booking.salonName}
                </h3>
                <BookingStatusBadge status={booking.status} />
              </div>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-foreground/55">
                <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
                {booking.salonArea}
              </p>
            </div>
            <span
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/60 text-foreground/50"
              aria-hidden
            >
              <ChevronRightIcon className="size-4" />
            </span>
          </header>

          <div className="grid grid-cols-2 gap-2 px-4 pb-3 sm:grid-cols-4 sm:px-5">
            <MetaChip icon={CalendarIcon} label="Date" value={formatBookingDate(booking.date)} />
            <MetaChip icon={ClockIcon} label="Time" value={booking.time} />
            <MetaChip
              icon={TimerIcon}
              label="Duration"
              value={`~${formatDuration(booking.durationMin)}`}
            />
            {booking.staffName ? (
              <MetaChip icon={UserIcon} label="Stylist" value={booking.staffName} />
            ) : (
              <div className="hidden min-w-0 rounded-lg border border-dashed border-border/50 bg-muted/20 px-3 py-2.5 sm:block" />
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border/55 px-4 py-3 sm:px-5">
            <p className="min-w-0 truncate text-sm text-foreground/60">{serviceSummary}</p>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
              {formatInr(breakdown.payable)}
            </p>
          </div>
        </button>
      </motion.article>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          showCloseButton
          className={
            isDesktop
              ? "flex h-full w-[min(92vw,440px)] flex-col gap-0 overflow-hidden p-0"
              : "flex max-h-[92vh] flex-col gap-0 overflow-hidden rounded-t-2xl p-0"
          }
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Booking summary for {booking.salonName}</SheetTitle>
          </SheetHeader>
          <BookingOrderSummary booking={booking} authenticated={authenticated} />
        </SheetContent>
      </Sheet>
    </>
  )
}
