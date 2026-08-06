"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { BookingSummaryCard } from "@/components/salons/booking-assistant/booking-summary-card"
import { RecommendationCard } from "@/components/salons/booking-assistant/recommendation-card"
import { SavingsCard } from "@/components/salons/booking-assistant/savings-card"
import { OfferEligibilityBanner } from "@/components/salons/offers/offer-eligibility-banner"
import {
  buildBookingLineItems,
  pickRecommendedAddOn,
  pickSpotlightOffer,
} from "@/components/salons/booking-assistant/assistant-utils"
import { AnimatedPrice } from "@/components/salons/booking-assistant/animated-price"
import { Button } from "@/components/ui/button"
import {
  applyOfferDiscount,
  computeBookingSubtotal,
  eligibleServicesForOffer,
  offerNotCoveredMessage,
  offerValidationMessage,
} from "@/lib/salons/offer-utils"
import { buildBookHref } from "@/lib/bookings/utils"
import { formatInr } from "@/lib/salons/catalog-utils"
import type { SalonOffer, SalonPackage, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

export type BookingAssistantSidebarProps = {
  services: SalonService[]
  offers: SalonOffer[]
  selectedIds: string[]
  selectedServices: SalonService[]
  extraServices: SalonService[]
  selectedPackage: SalonPackage | null
  salonId: string
  salonCoverImageUrl: string
  authenticated: boolean
  onRemoveService: (id: string) => void
  onClearPackage: () => void
  onAddService: (id: string) => void
  onViewEligibleServices?: (offer: SalonOffer) => void
  className?: string
  /** Render fixed mobile continue bar (only mount once). */
  showMobileBar?: boolean
}

export function BookingAssistantSidebar({
  services,
  offers,
  selectedIds,
  selectedServices,
  extraServices,
  selectedPackage,
  salonId,
  salonCoverImageUrl,
  authenticated,
  onRemoveService,
  onClearPackage,
  onAddService,
  onViewEligibleServices,
  className,
  showMobileBar = false,
}: BookingAssistantSidebarProps) {
  const [appliedOfferId, setAppliedOfferId] = useState<string | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [addedRecommendationId, setAddedRecommendationId] = useState<string | null>(null)

  const subtotal = useMemo(
    () =>
      computeBookingSubtotal({
        services,
        selectedServiceIds: selectedIds,
        selectedPackage,
      }),
    [services, selectedIds, selectedPackage],
  )

  const offerInput = useMemo(
    () => ({
      services,
      selectedServiceIds: selectedIds,
      selectedPackage,
      subtotal,
    }),
    [services, selectedIds, selectedPackage, subtotal],
  )

  const appliedOffer =
    appliedOfferId != null
      ? offers.find((offer) => offer.id === appliedOfferId) ?? null
      : null

  const spotlight = useMemo(() => {
    if (appliedOffer) {
      return (
        pickSpotlightOffer([appliedOffer], offerInput) ??
        pickSpotlightOffer(offers, offerInput)
      )
    }
    return pickSpotlightOffer(offers, offerInput)
  }, [appliedOffer, offers, offerInput])

  const discountResult = useMemo(() => {
    if (!appliedOffer) return null
    const result = applyOfferDiscount(appliedOffer, offerInput)
    return "error" in result ? null : result
  }, [appliedOffer, offerInput])

  const spotlightEligibility = useMemo(() => {
    if (!spotlight) {
      return { ineligible: false, message: null as string | null }
    }

    const hasCart = selectedIds.length > 0 || Boolean(selectedPackage)
    if (!hasCart) {
      return { ineligible: false, message: null }
    }

    const result = applyOfferDiscount(spotlight.offer, offerInput)
    if (!("error" in result)) {
      return { ineligible: false, message: null }
    }

    if (result.error === "no_eligible_services") {
      return {
        ineligible: true,
        message: offerNotCoveredMessage(spotlight.offer),
      }
    }

    return {
      ineligible: true,
      message: offerValidationMessage(result.error),
    }
  }, [spotlight, selectedIds.length, selectedPackage, offerInput])

  // Drop a previously applied offer if the cart no longer qualifies.
  useEffect(() => {
    if (!appliedOffer) return
    const result = applyOfferDiscount(appliedOffer, offerInput)
    if (!("error" in result)) return

    setAppliedOfferId(null)
    setApplyError(
      result.error === "no_eligible_services"
        ? offerNotCoveredMessage(appliedOffer)
        : offerValidationMessage(result.error),
    )
  }, [appliedOffer, offerInput])

  const discount = discountResult?.discountAmount ?? 0
  const estimatedTotal = Math.max(0, subtotal - discount)

  const spotlightEligibleServices = useMemo(() => {
    if (!spotlight) return []
    return eligibleServicesForOffer(spotlight.offer, services)
  }, [spotlight, services])

  const lines = useMemo(
    () =>
      buildBookingLineItems({
        selectedPackage,
        extraServices,
        selectedServices,
      }),
    [selectedPackage, extraServices, selectedServices],
  )

  const hasSelection = lines.length > 0

  const recommendation = useMemo(() => {
    if (!hasSelection) return null
    if (addedRecommendationId) {
      const pinned = services.find((service) => service.id === addedRecommendationId)
      if (pinned) return pinned
    }
    return pickRecommendedAddOn(services, selectedIds)
  }, [hasSelection, addedRecommendationId, services, selectedIds])

  const bookHref = buildBookHref(
    salonId,
    selectedIds,
    authenticated,
    selectedPackage?.id,
    discountResult ? appliedOffer?.code : undefined,
  )

  useEffect(() => {
    setApplyError(null)
  }, [selectedIds.join("|"), selectedPackage?.id])

  useEffect(() => {
    if (!hasSelection) {
      setAddedRecommendationId(null)
      return
    }
    if (addedRecommendationId && !selectedIds.includes(addedRecommendationId)) {
      setAddedRecommendationId(null)
    }
  }, [hasSelection, addedRecommendationId, selectedIds])

  return (
    <aside className={cn("space-y-4", className)}>
      <BookingSummaryCard
        className={lines.length === 0 ? "hidden lg:block" : undefined}
        lines={lines}
        subtotal={subtotal}
        discount={discount}
        estimatedTotal={estimatedTotal}
        bookHref={bookHref}
        onRemoveLine={(id, kind) => {
          if (kind === "package") {
            onClearPackage()
            return
          }
          onRemoveService(id)
        }}
      />

      {spotlight && (selectedIds.length > 0 || selectedPackage) ? (
        <OfferEligibilityBanner
          offer={spotlight.offer}
          qualifies={!spotlightEligibility.ineligible}
          onBrowseEligible={() => onViewEligibleServices?.(spotlight.offer)}
        />
      ) : null}

      <SavingsCard
        className="hidden lg:block"
        spotlight={
          spotlight
            ? {
                ...spotlight,
                currentSavings: discountResult?.discountAmount ?? spotlight.currentSavings,
              }
            : null
        }
        applied={Boolean(
          appliedOffer &&
            spotlight &&
            appliedOffer.id === spotlight.offer.id &&
            discountResult,
        )}
        ineligible={spotlightEligibility.ineligible}
        applyError={applyError ?? (spotlightEligibility.ineligible ? spotlightEligibility.message : null)}
        eligibleServices={spotlightEligibleServices}
        onViewEligibleServices={
          spotlight && onViewEligibleServices
            ? () => onViewEligibleServices(spotlight.offer)
            : undefined
        }
        onApply={() => {
          if (!spotlight) return

          const hasCart = selectedIds.length > 0 || Boolean(selectedPackage)
          if (!hasCart) {
            setApplyError("Add a service before applying this offer.")
            return
          }

          const result = applyOfferDiscount(spotlight.offer, offerInput)
          if ("error" in result) {
            setAppliedOfferId(null)
            setApplyError(
              result.error === "no_eligible_services"
                ? offerNotCoveredMessage(spotlight.offer)
                : offerValidationMessage(result.error),
            )
            return
          }

          setApplyError(null)
          setAppliedOfferId(spotlight.offer.id)
        }}
        onClear={() => {
          setAppliedOfferId(null)
          setApplyError(null)
        }}
      />

      <AnimatePresence initial={false}>
        {hasSelection && recommendation ? (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <RecommendationCard
              service={recommendation}
              fallbackImageUrl={salonCoverImageUrl}
              added={selectedIds.includes(recommendation.id)}
              onAdd={() => {
                onAddService(recommendation.id)
                setAddedRecommendationId(recommendation.id)
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showMobileBar && hasSelection ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/98 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
          <div className="mx-auto max-w-lg px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.12em] text-foreground/55 uppercase">
                  Your booking
                </p>
                <p className="mt-0.5 font-heading text-xl font-semibold text-foreground">
                  <AnimatedPrice value={estimatedTotal} />
                </p>
              </div>
              <p className="max-w-[45%] truncate text-right text-sm text-foreground/65">
                {lines.length} item{lines.length === 1 ? "" : "s"}
              </p>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href={bookHref}>{`Continue · ${formatInr(estimatedTotal)}`}</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
