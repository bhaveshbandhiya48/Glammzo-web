"use client"

import { SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatOfferDiscountLabel } from "@/lib/salons/offer-utils"
import type { SalonOffer } from "@/types/salon"
import { cn } from "@/lib/utils"

type OfferEligibilityBannerProps = {
  offer: SalonOffer
  qualifies: boolean
  applied?: boolean
  onApply?: () => void
  onBrowseEligible?: () => void
  className?: string
}

export function OfferEligibilityBanner({
  offer,
  qualifies,
  applied = false,
  onApply,
  onBrowseEligible,
  className,
}: OfferEligibilityBannerProps) {
  if (qualifies) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3",
          className,
        )}
        role="status"
      >
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
            <SparklesIcon className="size-3.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              Great! Your booking qualifies for {offer.code}
            </p>
            <p className="mt-0.5 text-xs text-emerald-800/80 dark:text-emerald-100/70">
              {formatOfferDiscountLabel(offer)} · {offer.title}
            </p>
            {!applied && onApply ? (
              <Button
                type="button"
                size="sm"
                className="mt-2.5"
                onClick={onApply}
              >
                Apply offer
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-muted/25 px-4 py-3",
        className,
      )}
      role="status"
    >
      <p className="text-sm font-semibold text-foreground">No discounts available yet</p>
      <p className="mt-1 text-xs text-foreground/60">
        Add an eligible service to unlock {offer.code}.
      </p>
      {onBrowseEligible ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2.5"
          onClick={onBrowseEligible}
        >
          Browse eligible services
        </Button>
      ) : null}
    </div>
  )
}
