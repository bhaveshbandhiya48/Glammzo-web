"use client"

import { ArrowRightIcon, PercentIcon, TagIcon } from "lucide-react"

import { EligibleServicesList } from "@/components/salons/offers/eligible-services-list"
import { Button } from "@/components/ui/button"
import {
  eligibleServicesForOffer,
  formatOfferDiscountLabel,
  formatOfferExpiry,
} from "@/lib/salons/offer-utils"
import { scrollToSalonServicesSection } from "@/lib/salons/salon-detail-scroll"
import type { SalonOffer, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type SalonOffersSectionProps = {
  offers: SalonOffer[]
  services?: SalonService[]
  salonId: string
  authenticated: boolean
  className?: string
  /** Hide section header when wrapped in SalonDetailSection */
  embedded?: boolean
}

export function SalonOffersSection({
  offers,
  services = [],
  className,
  embedded = false,
}: SalonOffersSectionProps) {
  if (offers.length === 0) return null

  return (
    <section className={cn("space-y-4", className)}>
      {embedded ? null : (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-eyebrow">Offers</p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
              Promo codes
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/65">
              Instant checkout discounts — enter the code in Promo code when you book. Not wallet
              cashback.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => scrollToSalonServicesSection()}
          >
            Book to redeem
          </Button>
        </div>
      )}

      <div
        className={cn(
          "grid gap-3",
          offers.length === 1 ? "grid-cols-1" : "sm:grid-cols-2",
        )}
      >
        {offers.map((offer) => {
          const expiry = formatOfferExpiry(offer.endsAt)
          const discountLabel = formatOfferDiscountLabel(offer)
          const eligibleServices = eligibleServicesForOffer(offer, services)

          return (
            <article
              key={offer.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-primary/20",
                "bg-gradient-to-br from-primary/[0.09] via-primary/[0.04] to-card",
                "p-4 sm:p-5",
                "transition duration-200 hover:border-primary/35 hover:shadow-md hover:shadow-primary/5",
              )}
            >
              <div
                className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-primary/10 blur-2xl"
                aria-hidden
              />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="flex min-w-0 flex-1 gap-3">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
                    {offer.discountType === "percent" ? (
                      <PercentIcon className="size-5" aria-hidden />
                    ) : (
                      <TagIcon className="size-5" aria-hidden />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-xl font-semibold tracking-tight text-primary sm:text-2xl">
                        {discountLabel}
                      </p>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-700 uppercase">
                        Instant off
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{offer.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-foreground/55">
                      <code className="rounded-md border border-dashed border-primary/35 bg-background/80 px-2 py-0.5 font-semibold tracking-wide text-primary">
                        {offer.code}
                      </code>
                      {expiry ? <span>Until {expiry}</span> : null}
                    </div>

                    <EligibleServicesList
                      className="mt-3"
                      appliesToAll={offer.appliesTo === "all_services"}
                      services={eligibleServices}
                    />

                    <p className="mt-2 text-xs leading-relaxed text-foreground/55">
                      Apply this code in{" "}
                      <span className="font-medium text-foreground/70">Promo code</span> at checkout —
                      instant discount on your total, not cashback.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  className="h-10 w-full shrink-0 rounded-full px-4 sm:h-9 sm:w-auto"
                  onClick={() => scrollToSalonServicesSection()}
                >
                  Book with code
                  <ArrowRightIcon className="size-3.5" aria-hidden />
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
