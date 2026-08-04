import Link from "next/link"
import { ArrowRightIcon, PercentIcon, TagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  formatOfferDiscountLabel,
  formatOfferExpiry,
} from "@/lib/salons/offer-utils"
import type { SalonOffer } from "@/types/salon"
import { cn } from "@/lib/utils"

type SalonOffersSectionProps = {
  offers: SalonOffer[]
  salonId: string
  authenticated: boolean
  className?: string
  /** Hide section header when wrapped in SalonDetailSection */
  embedded?: boolean
}

function buildOfferBookHref(salonId: string, code: string, authenticated: boolean) {
  const target = `/book/${salonId}?promo=${encodeURIComponent(code)}`
  return authenticated ? target : `/login?next=${encodeURIComponent(target)}`
}

export function SalonOffersSection({
  offers,
  salonId,
  authenticated,
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
          <Button asChild variant="outline">
            <Link href={buildOfferBookHref(salonId, offers[0]!.code, authenticated)}>
              Book to redeem
            </Link>
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
          const href = buildOfferBookHref(salonId, offer.code, authenticated)

          return (
            <article
              key={offer.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-primary/20",
                "bg-gradient-to-r from-primary/[0.09] via-primary/[0.04] to-card",
                "px-4 py-4 sm:px-5 sm:py-4",
                "transition duration-200 hover:border-primary/35 hover:shadow-md hover:shadow-primary/5",
              )}
            >
              <div
                className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-primary/10 blur-2xl"
                aria-hidden
              />

              <div className="relative flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
                    {offer.discountType === "percent" ? (
                      <PercentIcon className="size-5" aria-hidden />
                    ) : (
                      <TagIcon className="size-5" aria-hidden />
                    )}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-xl font-semibold tracking-tight text-primary sm:text-2xl">
                        {discountLabel}
                      </p>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-700 uppercase">
                        Instant off
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                      {offer.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground/55">
                      <code className="rounded-md border border-dashed border-primary/35 bg-background/80 px-2 py-0.5 font-semibold tracking-wide text-primary">
                        {offer.code}
                      </code>
                      {expiry ? <span>Until {expiry}</span> : null}
                      {offer.appliesTo === "selected_services" ? (
                        <span>Selected services</span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-foreground/55">
                      Apply this code in <span className="font-medium text-foreground/70">Promo code</span> at
                      checkout — instant discount on your total, not cashback.
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  size="sm"
                  className="ml-auto shrink-0 rounded-full px-4"
                >
                  <Link href={href}>
                    Book with code
                    <ArrowRightIcon className="size-3.5" aria-hidden />
                  </Link>
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
