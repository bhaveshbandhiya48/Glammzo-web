"use client"

import { formatOfferDiscountBadge } from "@/lib/salons/offer-utils"
import type { SalonOffer } from "@/types/salon"
import { cn } from "@/lib/utils"

type ServiceOfferBadgeProps = {
  offer: Pick<SalonOffer, "discountType" | "discountValue" | "code">
  variant?: "compact" | "soft"
  className?: string
}

export function ServiceOfferBadge({
  offer,
  variant = "compact",
  className,
}: ServiceOfferBadgeProps) {
  const label = formatOfferDiscountBadge(offer)

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        variant === "compact" &&
          "bg-primary text-primary-foreground shadow-sm shadow-primary/20",
        variant === "soft" &&
          "border border-primary/20 bg-primary/10 text-primary",
        className,
      )}
    >
      {label}
    </span>
  )
}

type OfferAvailableBadgeProps = {
  className?: string
}

export function OfferAvailableBadge({ className }: OfferAvailableBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary/20 bg-background/95 px-2 py-0.5 text-[10px] font-medium text-primary shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      Offer available
    </span>
  )
}
