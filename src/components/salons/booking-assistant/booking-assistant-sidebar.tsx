"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, useTransition } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { BookingSummaryCard } from "@/components/salons/booking-assistant/booking-summary-card"
import { RecommendationCard } from "@/components/salons/booking-assistant/recommendation-card"
import { PromoSuccessDialog } from "@/components/salons/booking-assistant/promo-success-dialog"
import { SavingsCard } from "@/components/salons/booking-assistant/savings-card"
import { OfferEligibilityBanner } from "@/components/salons/offers/offer-eligibility-banner"
import {
  buildBookingLineItems,
  isGlammzoSpotlightOfferId,
  listGlammzoSpotlightOffers,
  listSpotlightOffers,
  mergeSpotlightOffers,
  pickRecommendedAddOn,
} from "@/components/salons/booking-assistant/assistant-utils"
import { AnimatedPrice } from "@/components/salons/booking-assistant/animated-price"
import { Button } from "@/components/ui/button"
import {
  applyOfferDiscount,
  computeBookingSubtotal,
  eligibleServicesForOffer,
  offerNotCoveredMessage,
  offerValidationMessage,
  type AppliedOfferDiscount,
} from "@/lib/salons/offer-utils"
import {
  getCartOfferEligibilityAction,
  validatePromoCodeAction,
} from "@/lib/bookings/promo-actions"
import { buildBookHref } from "@/lib/bookings/utils"
import type { GlammzoOffer } from "@/lib/marketing/glammzo-offers"
import { formatInr } from "@/lib/salons/catalog-utils"
import type { SalonOffer, SalonPackage, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

export type BookingAssistantSidebarProps = {
  services: SalonService[]
  offers: SalonOffer[]
  glammzoOffers?: GlammzoOffer[]
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
  glammzoOffers = [],
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
  const [applyErrorOfferId, setApplyErrorOfferId] = useState<string | null>(null)
  const [addedRecommendationId, setAddedRecommendationId] = useState<string | null>(null)
  const [celebrationDiscount, setCelebrationDiscount] =
    useState<AppliedOfferDiscount | null>(null)
  const [celebrationKind, setCelebrationKind] = useState<"discount" | "cashback">(
    "discount",
  )
  const [celebrationOpen, setCelebrationOpen] = useState(false)
  const [customerBlocked, setCustomerBlocked] = useState<Record<string, string>>(
    {},
  )
  const [isApplying, startApplyTransition] = useTransition()
  const [applyingOfferId, setApplyingOfferId] = useState<string | null>(null)

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

  const hasCart = selectedIds.length > 0 || Boolean(selectedPackage)

  const spotlightOffers = useMemo(() => {
    const salonSpotlights = listSpotlightOffers(offers, offerInput)
    const glammzoSpotlights = listGlammzoSpotlightOffers(glammzoOffers, {
      subtotal,
      hasCart,
    })
    return mergeSpotlightOffers(salonSpotlights, glammzoSpotlights)
  }, [offers, glammzoOffers, offerInput, subtotal, hasCart])

  const eligibilityKey = useMemo(() => {
    const salonKey = offers.map((offer) => offer.id).sort().join(",")
    const glammzoKey = glammzoOffers.map((offer) => offer.id).sort().join(",")
    return `${salonKey}|${glammzoKey}`
  }, [offers, glammzoOffers])

  useEffect(() => {
    if (offers.length === 0 && glammzoOffers.length === 0) {
      setCustomerBlocked({})
      return
    }

    let cancelled = false
    void getCartOfferEligibilityAction({
      salonId,
      items: [
        ...offers.map((offer) => ({
          id: offer.id,
          code: offer.code,
          kind: "salon" as const,
          customerEligibility: offer.customerEligibility,
        })),
        ...glammzoOffers
          .filter((offer) => Boolean(offer.promoCode?.trim()))
          .map((offer) => ({
            id: `glammzo:${offer.id}`,
            code: offer.promoCode!.trim().toUpperCase(),
            kind: "glammzo" as const,
            glammzoOfferId: offer.id,
          })),
      ],
    })
      .then((blocked) => {
        if (!cancelled) setCustomerBlocked(blocked)
      })
      .catch(() => {
        if (!cancelled) setCustomerBlocked({})
      })

    return () => {
      cancelled = true
    }
  }, [salonId, eligibilityKey, offers, glammzoOffers])

  const appliedSpotlight =
    appliedOfferId != null
      ? spotlightOffers.find((item) => item.offer.id === appliedOfferId) ?? null
      : null

  const appliedOffer = appliedSpotlight?.offer ?? null
  const appliedIsGlammzo = Boolean(appliedSpotlight?.isGlammzo)

  const spotlight = useMemo(() => {
    if (appliedSpotlight) return appliedSpotlight
    return (
      spotlightOffers.find((item) => item.isBestForCart) ??
      spotlightOffers[0] ??
      null
    )
  }, [appliedSpotlight, spotlightOffers])

  const discountResult = useMemo(() => {
    if (!appliedOffer || appliedIsGlammzo) return null
    const result = applyOfferDiscount(appliedOffer, offerInput)
    return "error" in result ? null : result
  }, [appliedOffer, appliedIsGlammzo, offerInput])

  const savingsItems = useMemo(() => {
    return spotlightOffers.map((item) => {
      const isApplied = Boolean(
        appliedOffer && appliedOffer.id === item.offer.id,
      )

      if (item.isGlammzo) {
        const customerError = customerBlocked[item.offer.id] ?? null
        const belowMin = hasCart && item.amountToUnlock > 0
        const ineligible = Boolean(customerError) || (hasCart && belowMin)
        return {
          spotlight: {
            ...item,
            currentSavings: isApplied
              ? item.offer.discountValue
              : item.currentSavings,
          },
          applied: isApplied,
          ineligible,
          applyError:
            (applyError && applyErrorOfferId === item.offer.id
              ? applyError
              : null) ?? customerError,
          eligibleServices: [] as SalonService[],
        }
      }

      const isAppliedWithDiscount = Boolean(isApplied && discountResult)
      const currentSavings = isAppliedWithDiscount
        ? (discountResult?.discountAmount ?? item.currentSavings)
        : item.currentSavings

      const customerError = customerBlocked[item.offer.id] ?? null
      let ineligible = Boolean(customerError)
      let message: string | null = customerError

      if (hasCart) {
        const result = applyOfferDiscount(item.offer, offerInput)
        if ("error" in result) {
          ineligible = true
          if (result.error === "no_eligible_services") {
            message = customerError ?? offerNotCoveredMessage(item.offer)
          } else if (result.error !== "below_min_order") {
            message = customerError ?? offerValidationMessage(result.error)
          }
        }
      }

      const itemApplyError =
        (applyError && applyErrorOfferId === item.offer.id ? applyError : null) ??
        message

      return {
        spotlight: { ...item, currentSavings },
        applied: isAppliedWithDiscount,
        ineligible,
        applyError: itemApplyError,
        eligibleServices: eligibleServicesForOffer(item.offer, services),
      }
    })
  }, [
    spotlightOffers,
    appliedOffer,
    discountResult,
    hasCart,
    offerInput,
    applyError,
    applyErrorOfferId,
    services,
    customerBlocked,
  ])

  const spotlightEligibility = useMemo(() => {
    if (!spotlight || spotlight.isGlammzo) {
      return { ineligible: false, message: null as string | null }
    }

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

    if (result.error === "below_min_order") {
      return { ineligible: true, message: null }
    }

    return {
      ineligible: true,
      message: offerValidationMessage(result.error),
    }
  }, [spotlight, hasCart, offerInput])

  // Drop a previously applied offer if the cart no longer qualifies.
  useEffect(() => {
    if (!appliedOffer || appliedIsGlammzo) return
    if (customerBlocked[appliedOffer.id]) {
      setAppliedOfferId(null)
      return
    }
    const result = applyOfferDiscount(appliedOffer, offerInput)
    if (!("error" in result)) return

    setAppliedOfferId(null)
    if (result.error === "below_min_order") {
      setApplyError(null)
      setApplyErrorOfferId(null)
      return
    }
    setApplyErrorOfferId(appliedOffer.id)
    setApplyError(
      result.error === "no_eligible_services"
        ? offerNotCoveredMessage(appliedOffer)
        : offerValidationMessage(result.error),
    )
  }, [appliedOffer, appliedIsGlammzo, offerInput, customerBlocked])

  // Drop Glammzo cashback if cart is empty, below min spend, or customer-blocked.
  useEffect(() => {
    if (!appliedSpotlight?.isGlammzo) return
    if (
      !hasCart ||
      appliedSpotlight.amountToUnlock > 0 ||
      customerBlocked[appliedSpotlight.offer.id]
    ) {
      setAppliedOfferId(null)
      setApplyError(null)
      setApplyErrorOfferId(null)
    }
  }, [appliedSpotlight, hasCart, customerBlocked])

  const discount = discountResult?.discountAmount ?? 0
  const estimatedTotal = Math.max(0, subtotal - discount)
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

  const appliedPromoCode =
    appliedOffer && (appliedIsGlammzo || discountResult)
      ? appliedOffer.code
      : undefined

  const bookHref = buildBookHref(
    salonId,
    selectedIds,
    authenticated,
    selectedPackage?.id,
    appliedPromoCode,
  )

  useEffect(() => {
    setApplyError(null)
    setApplyErrorOfferId(null)
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

      {spotlight &&
      !spotlight.isGlammzo &&
      (selectedIds.length > 0 || selectedPackage) ? (
        <OfferEligibilityBanner
          offer={spotlight.offer}
          qualifies={!spotlightEligibility.ineligible}
          onBrowseEligible={() => onViewEligibleServices?.(spotlight.offer)}
        />
      ) : null}

      <SavingsCard
        className="hidden lg:block"
        items={savingsItems}
        hasCart={hasCart}
        applyingOfferId={isApplying ? applyingOfferId : null}
        onViewEligibleServices={onViewEligibleServices}
        onApply={(offer) => {
          if (!hasCart) {
            setApplyErrorOfferId(offer.id)
            setApplyError("Add a service before applying this offer.")
            return
          }

          const blockedMessage = customerBlocked[offer.id]
          if (blockedMessage) {
            setApplyErrorOfferId(offer.id)
            setApplyError(blockedMessage)
            return
          }

          if (isGlammzoSpotlightOfferId(offer.id)) {
            const glammzoItem = spotlightOffers.find(
              (item) => item.offer.id === offer.id,
            )
            if (!glammzoItem || glammzoItem.amountToUnlock > 0) {
              setApplyError(null)
              setApplyErrorOfferId(null)
              return
            }
            if (!offer.code) {
              setApplyErrorOfferId(offer.id)
              setApplyError("This Glammzo offer has no promo code.")
              return
            }
          } else {
            const localResult = applyOfferDiscount(offer, offerInput)
            if ("error" in localResult) {
              setAppliedOfferId(null)
              if (localResult.error === "below_min_order") {
                setApplyError(null)
                setApplyErrorOfferId(null)
                return
              }
              setApplyErrorOfferId(offer.id)
              setApplyError(
                localResult.error === "no_eligible_services"
                  ? offerNotCoveredMessage(offer)
                  : offerValidationMessage(localResult.error),
              )
              return
            }
          }

          setApplyingOfferId(offer.id)
          startApplyTransition(async () => {
            const result = await validatePromoCodeAction({
              salonId,
              code: offer.code,
              serviceIds: selectedIds,
              packageId: selectedPackage?.id ?? null,
            })

            if (!result.success) {
              setAppliedOfferId(null)
              setApplyErrorOfferId(offer.id)
              setApplyError(result.error)
              if (
                /new customer|first-time|sign in|already used|already applied/i.test(
                  result.error,
                )
              ) {
                setCustomerBlocked((current) => ({
                  ...current,
                  [offer.id]: result.error,
                }))
              }
              setApplyingOfferId(null)
              return
            }

            setApplyError(null)
            setApplyErrorOfferId(null)
            setAppliedOfferId(offer.id)

            if (result.kind === "cashback") {
              setCelebrationKind("cashback")
              setCelebrationDiscount({
                offerId: offer.id,
                code: result.code,
                title: offer.title,
                discountType: "fixed",
                discountValue: result.cashbackRupees,
                subtotal,
                discountAmount: result.cashbackRupees,
                finalTotal: subtotal,
              })
            } else {
              setCelebrationKind("discount")
              setCelebrationDiscount(result.discount)
            }
            setCelebrationOpen(true)
            setApplyingOfferId(null)
          })
        }}
        onClear={() => {
          setAppliedOfferId(null)
          setApplyError(null)
          setApplyErrorOfferId(null)
          setCelebrationDiscount(null)
          setCelebrationOpen(false)
        }}
      />

      <PromoSuccessDialog
        open={celebrationOpen}
        discount={celebrationDiscount}
        rewardKind={celebrationKind}
        onOpenChange={(open) => {
          setCelebrationOpen(open)
          if (!open) setCelebrationDiscount(null)
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

