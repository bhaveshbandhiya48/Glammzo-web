"use client"

import { TagIcon } from "lucide-react"

import { ServiceOfferBadge } from "@/components/salons/offers/service-offer-badge"
import {
  formatOfferDiscountLabel,
  formatOfferExpiry,
} from "@/lib/salons/offer-utils"
import type { SalonOffer } from "@/types/salon"
import { cn } from "@/lib/utils"

type ServiceDetailOffersProps = {
  offers: SalonOffer[]
  className?: string
}

export function ServiceDetailOffers({ offers, className }: ServiceDetailOffersProps) {
  if (offers.length === 0) return null

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <TagIcon className="size-4 text-primary" aria-hidden />
        <p className="text-sm font-semibold text-foreground">Offers available</p>
      </div>

      <ul className="space-y-2">
        {offers.map((offer) => (
          <li
            key={offer.id}
            className="rounded-xl border border-primary/15 bg-primary/[0.04] px-3.5 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{offer.title}</p>
                <p className="mt-0.5 text-sm text-primary">
                  {formatOfferDiscountLabel(offer)}
                </p>
              </div>
              <ServiceOfferBadge offer={offer} variant="soft" />
            </div>
            <p className="mt-2 text-xs text-foreground/55">
              Promo code{" "}
              <code className="rounded border border-dashed border-primary/30 bg-background/80 px-1.5 py-0.5 font-semibold tracking-wide text-primary">
                {offer.code}
              </code>
            </p>
            <p className="mt-1.5 text-xs font-medium text-foreground/70">
              Eligible for this service · Apply at checkout
              {offer.endsAt ? ` · Until ${formatOfferExpiry(offer.endsAt)}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
