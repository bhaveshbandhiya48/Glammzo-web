"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { CalendarCheck2Icon, SparklesIcon, XIcon } from "lucide-react"

import { AnimatedPrice } from "@/components/salons/booking-assistant/animated-price"
import type { BookingLineItem } from "@/components/salons/booking-assistant/assistant-utils"
import { Button } from "@/components/ui/button"
import { formatDuration } from "@/lib/bookings/utils"
import { formatInr } from "@/lib/salons/catalog-utils"
import { formatGstLineLabel } from "@/lib/salons/tax-utils"
import type { SalonTaxInfo } from "@/types/salon"
import { cn } from "@/lib/utils"

export type BookingSummaryCardProps = {
  lines: BookingLineItem[]
  subtotal: number
  discount: number
  tax?: SalonTaxInfo | null
  gstAmount?: number
  estimatedTotal: number
  bookHref: string
  onRemoveLine?: (id: string, kind: BookingLineItem["kind"]) => void
  className?: string
}

export function BookingSummaryCard({
  lines,
  subtotal,
  discount,
  tax = null,
  gstAmount = 0,
  estimatedTotal,
  bookHref,
  onRemoveLine,
  className,
}: BookingSummaryCardProps) {
  const hasSelection = lines.length > 0
  const showGst = Boolean(tax && gstAmount > 0)

  return (
    <section
      className={cn(
        "rounded-3xl border border-border/70 bg-card p-5 shadow-sm shadow-black/[0.04]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
          Your booking
        </p>
        {hasSelection && discount > 0 ? (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            You saved{" "}
            <AnimatedPrice value={discount} className="inline text-[11px] font-semibold" />
          </span>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {!hasSelection ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-5 flex flex-col items-center text-center"
          >
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarCheck2Icon className="size-5" aria-hidden />
            </span>
            <p className="mt-3 font-heading text-base font-semibold text-foreground">
              No services selected
            </p>
            <p className="mt-1 max-w-[16rem] text-sm leading-relaxed text-foreground/55">
              Choose one or more services to begin your booking.
            </p>
            <Button size="lg" className="mt-5 w-full" disabled>
              Continue
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="filled"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4"
          >
            <ul className="space-y-2.5">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{line.name}</p>
                    <p className="mt-0.5 text-xs text-foreground/55">
                      {line.kind === "package" ? "Package · " : ""}
                      {formatDuration(line.durationMin)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-start gap-1.5">
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      <AnimatedPrice value={line.price} />
                    </p>
                    {onRemoveLine ? (
                      <button
                        type="button"
                        onClick={() => onRemoveLine(line.id, line.kind)}
                        className="rounded-full p-1 text-foreground/40 transition-colors hover:bg-accent hover:text-foreground"
                        aria-label={`Remove ${line.name}`}
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-2 rounded-2xl border border-border/60 bg-background/70 px-3.5 py-3.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-foreground/55">Subtotal</span>
                <AnimatedPrice value={subtotal} className="font-medium text-foreground" />
              </div>
              {discount > 0 ? (
                <div className="flex items-center justify-between gap-3 text-emerald-700">
                  <span className="inline-flex items-center gap-1.5">
                    <SparklesIcon className="size-3.5" aria-hidden />
                    Discount
                  </span>
                  <span className="font-medium">
                    −
                    <AnimatedPrice value={discount} className="inline font-medium" />
                  </span>
                </div>
              ) : null}
              {showGst && tax ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground/55">{formatGstLineLabel(tax)}</span>
                  <AnimatedPrice value={gstAmount} className="font-medium text-foreground" />
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 text-foreground/45">
                  <span>Taxes</span>
                  <span className="text-xs">Not applicable</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-2.5">
                <span className="text-xs font-semibold tracking-[0.12em] text-foreground/45 uppercase">
                  Estimated total
                </span>
                <AnimatedPrice
                  value={estimatedTotal}
                  className="font-heading text-xl font-semibold text-foreground"
                />
              </div>
            </div>

            <Button asChild size="lg" className="relative z-10 w-full">
              <Link href={bookHref}>{`Continue · ${formatInr(estimatedTotal)}`}</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
