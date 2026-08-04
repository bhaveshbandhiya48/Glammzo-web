"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckIcon, GiftIcon } from "lucide-react"

import { EligibleServicesList } from "@/components/salons/offers/eligible-services-list"
import { ProgressOffer } from "@/components/salons/booking-assistant/progress-offer"
import type { SpotlightOffer } from "@/components/salons/booking-assistant/assistant-utils"
import { Button } from "@/components/ui/button"
import { formatInr } from "@/lib/salons/catalog-utils"
import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

export type SavingsCardProps = {
  spotlight: SpotlightOffer | null
  applied: boolean
  /** Why Apply is blocked / last failed apply (e.g. service not covered). */
  applyError?: string | null
  /** True when the spotlight offer cannot discount the current cart. */
  ineligible?: boolean
  eligibleServices?: SalonService[]
  onApply: () => void
  onClear?: () => void
  onViewEligibleServices?: () => void
  className?: string
}

export function SavingsCard({
  spotlight,
  applied,
  applyError = null,
  ineligible = false,
  eligibleServices = [],
  onApply,
  onClear,
  onViewEligibleServices,
  className,
}: SavingsCardProps) {
  if (!spotlight) return null

  const { offer, discountLabel, daysLeft, minSpend, amountToUnlock, unlockProgress, currentSavings } =
    spotlight

  return (
    <section
      className={cn(
        "rounded-3xl border border-border/70 bg-card p-5 shadow-sm shadow-black/[0.04]",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <GiftIcon className="size-4" aria-hidden />
        </span>
        <h3 className="font-heading text-base font-semibold text-foreground">
          Available Savings
        </h3>
      </div>

      <article className="mt-4 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-card to-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-heading text-2xl font-semibold tracking-tight text-primary">
              {discountLabel}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{offer.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground/55">
              <code className="rounded-md border border-dashed border-primary/30 bg-background/80 px-2 py-0.5 font-semibold tracking-wide text-primary">
                {offer.code}
              </code>
              {minSpend ? <span>Min spend {formatInr(minSpend)}</span> : null}
              {daysLeft != null ? (
                <span>
                  {daysLeft <= 0
                    ? "Expires today"
                    : daysLeft === 1
                      ? "Expires in 1 day"
                      : `Expires in ${daysLeft} days`}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <EligibleServicesList
          className="mt-4"
          appliesToAll={offer.appliesTo === "all_services"}
          services={eligibleServices}
        />

        {offer.appliesTo === "selected_services" &&
        eligibleServices.length > 0 &&
        onViewEligibleServices ? (
          <button
            type="button"
            onClick={onViewEligibleServices}
            className="mt-2 text-xs font-semibold text-primary underline-offset-2 hover:underline"
          >
            View eligible services
          </button>
        ) : null}

        <AnimatePresence mode="wait">
          {applied ? (
            <motion.div
              key="applied"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-4 space-y-2"
            >
              <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                <CheckIcon className="size-4" aria-hidden />
                Applied successfully
                {currentSavings > 0 ? ` · Save ${formatInr(currentSavings)}` : null}
              </div>
              {onClear ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="w-full text-center text-xs font-medium text-foreground/50 underline-offset-2 hover:text-foreground hover:underline"
                >
                  Remove offer
                </button>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="apply"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-4 space-y-2"
            >
              <Button type="button" className="w-full" onClick={onApply} disabled={ineligible}>
                Apply
              </Button>
              {ineligible || applyError ? (
                <p
                  className="rounded-xl bg-amber-500/10 px-3 py-2 text-center text-xs font-medium text-amber-900 dark:text-amber-100"
                  role="status"
                >
                  {applyError ?? "Offer not applied — this service isn't covered."}
                </p>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {amountToUnlock > 0 ? (
          <ProgressOffer
            className="mt-4"
            amountToUnlock={amountToUnlock}
            progress={unlockProgress}
            rewardLabel={discountLabel}
          />
        ) : null}
      </article>
    </section>
  )
}
