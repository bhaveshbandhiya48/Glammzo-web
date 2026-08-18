"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckIcon, ChevronDownIcon, GiftIcon, WalletIcon } from "lucide-react"

import { EligibleServicesList } from "@/components/salons/offers/eligible-services-list"
import { ProgressOffer } from "@/components/salons/booking-assistant/progress-offer"
import type { SpotlightOffer } from "@/components/salons/booking-assistant/assistant-utils"
import { Button } from "@/components/ui/button"
import { formatInr } from "@/lib/salons/catalog-utils"
import type { SalonOffer, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

export type SavingsOfferState = {
  spotlight: SpotlightOffer
  applied: boolean
  ineligible: boolean
  applyError?: string | null
  eligibleServices: SalonService[]
}

export type SavingsCardProps = {
  items: SavingsOfferState[]
  /** True when the bag has at least one service or package. */
  hasCart?: boolean
  onApply: (offer: SalonOffer) => void
  onClear?: () => void
  onViewEligibleServices?: (offer: SalonOffer) => void
  className?: string
}

function OfferPanelBody({
  item,
  hasCart,
  onApply,
  onClear,
  onViewEligibleServices,
}: {
  item: SavingsOfferState
  hasCart: boolean
  onApply: (offer: SalonOffer) => void
  onClear?: () => void
  onViewEligibleServices?: (offer: SalonOffer) => void
}) {
  const { spotlight, applied, ineligible, applyError = null, eligibleServices } = item
  const {
    offer,
    daysLeft,
    minSpend,
    amountToUnlock,
    unlockProgress,
    currentSavings,
    isGlammzo,
  } = spotlight
  const showMinOrderProgress = hasCart && amountToUnlock > 0
  const isEligibleToApply = hasCart && !ineligible && !applied
  const coverageBlocked =
    Boolean(applyError) && /covered|eligible service/i.test(applyError ?? "")
  const showApplyError =
    Boolean(applyError || (ineligible && coverageBlocked)) &&
    (!showMinOrderProgress || coverageBlocked)
  const accentCode = isGlammzo
    ? "border-foreground/30 text-foreground"
    : "border-primary/30 text-primary"
  const applyBtnClass = isGlammzo
    ? "bg-foreground text-background shadow-none hover:bg-foreground/90 hover:shadow-none focus-visible:ring-foreground/30"
    : undefined

  return (
    <div className="space-y-3 border-t border-border/50 px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground/55">
        <code
          className={cn(
            "rounded-md border border-dashed bg-background/80 px-2 py-0.5 font-semibold tracking-wide",
            accentCode,
          )}
        >
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

      {isGlammzo ? (
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/65">
          <WalletIcon className="size-3.5 shrink-0" aria-hidden />
          Wallet cashback after your visit · applies to this booking
        </p>
      ) : (
        <EligibleServicesList
          appliesToAll={offer.appliesTo === "all_services"}
          services={eligibleServices}
        />
      )}

      {!isGlammzo &&
      offer.appliesTo === "selected_services" &&
      eligibleServices.length > 0 &&
      onViewEligibleServices ? (
        <button
          type="button"
          onClick={() => onViewEligibleServices(offer)}
          className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
        >
          View eligible services
        </button>
      ) : null}

      {isEligibleToApply ? (
        <p
          className={cn(
            "rounded-xl px-3 py-2.5 text-center text-sm font-medium",
            isGlammzo
              ? "bg-foreground/5 text-foreground"
              : "bg-emerald-500/10 text-emerald-700",
          )}
          role="status"
        >
          {isGlammzo
            ? "🎉 You've unlocked this Glammzo cashback — tap Apply to claim it."
            : "🎉 Congratulations! You've unlocked this offer — tap Apply to claim it."}
        </p>
      ) : null}

      <AnimatePresence mode="wait">
        {applied ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="space-y-2"
          >
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-700">
              <CheckIcon className="size-4" aria-hidden />
              {isGlammzo
                ? `Applied · ${formatInr(currentSavings)} cashback after visit`
                : `Applied successfully${currentSavings > 0 ? ` · Save ${formatInr(currentSavings)}` : ""}`}
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
            className="space-y-2"
          >
            <Button
              type="button"
              className={cn("w-full", applyBtnClass)}
              onClick={() => onApply(offer)}
              disabled={!hasCart || ineligible}
            >
              Apply
            </Button>
            {showApplyError ? (
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

      {showMinOrderProgress ? (
        <ProgressOffer amountToUnlock={amountToUnlock} progress={unlockProgress} />
      ) : null}
    </div>
  )
}

export function SavingsCard({
  items,
  hasCart = false,
  onApply,
  onClear,
  onViewEligibleServices,
  className,
}: SavingsCardProps) {
  const useAccordion = items.length > 1
  const defaultOpenId =
    items.find((item) => item.applied)?.spotlight.offer.id ??
    items.find((item) => item.spotlight.isBestForCart)?.spotlight.offer.id ??
    items[0]?.spotlight.offer.id ??
    null
  const [openId, setOpenId] = useState<string | null>(defaultOpenId)

  useEffect(() => {
    if (!useAccordion) {
      setOpenId(items[0]?.spotlight.offer.id ?? null)
      return
    }
    const appliedId = items.find((item) => item.applied)?.spotlight.offer.id
    if (appliedId) {
      setOpenId(appliedId)
      return
    }
    const bestId = items.find((item) => item.spotlight.isBestForCart)?.spotlight.offer.id
    setOpenId((current) => {
      if (bestId) return bestId
      if (current && items.some((item) => item.spotlight.offer.id === current)) {
        return current
      }
      return items[0]?.spotlight.offer.id ?? null
    })
  }, [items, useAccordion])

  if (items.length === 0) return null

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

      <div className={cn("mt-4", useAccordion ? "space-y-2" : undefined)}>
        {items.map((item) => {
          const { spotlight, applied } = item
          const offerId = spotlight.offer.id
          const isOpen = !useAccordion || openId === offerId
          const isGlammzo = Boolean(spotlight.isGlammzo)
          const accentText = isGlammzo ? "text-foreground" : "text-primary"
          const badgeBest = isGlammzo
            ? "bg-foreground/10 text-foreground"
            : "bg-primary/10 text-primary"
          const cardShell = isGlammzo
            ? "border-foreground/15 bg-gradient-to-br from-foreground/[0.06] via-card to-card"
            : "border-primary/15 bg-gradient-to-br from-primary/[0.06] via-card to-card"

          return (
            <article
              key={offerId}
              className={cn("overflow-hidden rounded-2xl border", cardShell)}
            >
              {useAccordion ? (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : offerId)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          "font-heading text-lg font-semibold tracking-tight",
                          accentText,
                        )}
                      >
                        {spotlight.discountLabel}
                      </p>
                      {isGlammzo ? (
                        <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold text-foreground uppercase">
                          Glammzo
                        </span>
                      ) : null}
                      {spotlight.isBestForCart ? (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                            badgeBest,
                          )}
                        >
                          Best for you
                        </span>
                      ) : null}
                      {applied ? (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 uppercase">
                          Applied
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                      {spotlight.offer.title}
                    </p>
                  </div>
                  <ChevronDownIcon
                    className={cn(
                      "size-4 shrink-0 text-foreground/45 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
              ) : (
                <div className="px-4 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "font-heading text-2xl font-semibold tracking-tight",
                        accentText,
                      )}
                    >
                      {spotlight.discountLabel}
                    </p>
                    {isGlammzo ? (
                      <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold text-foreground uppercase">
                        Glammzo
                      </span>
                    ) : null}
                    {spotlight.isBestForCart ? (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                          badgeBest,
                        )}
                      >
                        Best for you
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {spotlight.offer.title}
                  </p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    key={`${offerId}-body`}
                    initial={useAccordion ? { height: 0, opacity: 0 } : false}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={useAccordion ? { height: 0, opacity: 0 } : undefined}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <OfferPanelBody
                      item={item}
                      hasCart={hasCart}
                      onApply={onApply}
                      onClear={applied ? onClear : undefined}
                      onViewEligibleServices={onViewEligibleServices}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </article>
          )
        })}
      </div>
    </section>
  )
}
