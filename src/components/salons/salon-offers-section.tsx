import { TagIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
}: SalonOffersSectionProps) {
  if (offers.length === 0) return null

  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-eyebrow">Offers</p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
            Promo codes
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/65">
            Apply these codes at checkout when you book online.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={buildOfferBookHref(salonId, offers[0]!.code, authenticated)}>
            Book to redeem
          </a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {offers.map((offer) => {
          const expiry = formatOfferExpiry(offer.endsAt)

          return (
            <article
              key={offer.id}
              className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm shadow-black/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TagIcon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      {offer.title}
                    </h3>
                    {offer.description ? (
                      <p className="mt-1 text-sm leading-relaxed text-foreground/65">
                        {offer.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Badge className="shrink-0 rounded-full bg-primary/10 text-primary hover:bg-primary/10">
                  {formatOfferDiscountLabel(offer)}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <code className="rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-semibold tracking-wide text-primary">
                  {offer.code}
                </code>
                {expiry ? (
                  <span className="text-xs text-foreground/55">Valid until {expiry}</span>
                ) : null}
                {offer.appliesTo === "selected_services" ? (
                  <span className="text-xs text-foreground/55">Selected services only</span>
                ) : null}
                <Button asChild variant="link" className="h-auto px-0 text-primary">
                  <a href={buildOfferBookHref(salonId, offer.code, authenticated)}>
                    Use at checkout
                  </a>
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
