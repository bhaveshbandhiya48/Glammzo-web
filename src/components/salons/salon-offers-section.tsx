"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  BadgePercentIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
} from "lucide-react"

import { GlammzoOfferCard } from "@/components/salons/offers/glammzo-offers-section"
import { OfferTermsDialog } from "@/components/salons/offers/offer-terms-dialog"
import { Button } from "@/components/ui/button"
import type { GlammzoOffer } from "@/lib/marketing/glammzo-offers"
import {
  eligibleServicesForOffer,
  formatOfferExpiry,
} from "@/lib/salons/offer-utils"
import { scrollToSalonServicesSection } from "@/lib/salons/salon-detail-scroll"
import type { SalonOffer, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type SalonOffersSectionProps = {
  offers: SalonOffer[]
  glammzoOffers?: GlammzoOffer[]
  services?: SalonService[]
  salonId: string
  authenticated: boolean
  className?: string
  /** Hide section header when wrapped in SalonDetailSection */
  embedded?: boolean
}

/** Wider card + peek of next. Gap is 0.75rem (gap-3). */
const CARD_WIDTH = "w-[min(100%,26rem)] sm:w-[28rem]"
const CARD_GAP_PX = 12

type UnifiedOfferItem =
  | { kind: "glammzo"; id: string; title: string; offer: GlammzoOffer }
  | { kind: "salon"; id: string; title: string; offer: SalonOffer }

function servicesLine(offer: SalonOffer, services: SalonService[]) {
  if (offer.appliesTo === "all_services") return "All services"
  if (services.length > 0) {
    const eligible = eligibleServicesForOffer(offer, services)
    if (eligible.length > 0 && eligible.length === services.length) {
      return "All services"
    }
    if (eligible.length === 1) return eligible[0]!.name
    if (eligible.length > 1) return `${eligible.length} services`
  }
  return "Selected services"
}

function discountBadgeLabel(offer: SalonOffer) {
  if (offer.discountType === "percent") {
    return `${offer.discountValue}% OFF`
  }
  return `₹${offer.discountValue} OFF`
}

function OfferCodeChip({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={copyCode}
      aria-label={copied ? "Promo code copied" : `Copy promo code ${code}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/40",
        "bg-primary/[0.06] px-2 py-1 font-mono text-[11px] font-semibold tracking-[0.06em] text-primary",
        "transition-colors hover:border-primary/60 hover:bg-primary/10",
      )}
    >
      {code}
      {copied ? (
        <CheckIcon className="size-3 text-emerald-600" aria-hidden />
      ) : (
        <CopyIcon className="size-3 opacity-70" aria-hidden />
      )}
    </button>
  )
}

function OfferCard({
  offer,
  services,
}: {
  offer: SalonOffer
  services: SalonService[]
}) {
  const expiry = formatOfferExpiry(offer.endsAt)
  const badge = discountBadgeLabel(offer)
  const description =
    typeof offer.description === "string" ? offer.description.trim() : ""
  const cta = offer.ctaLabel?.trim() || "Book now"

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3.5",
        "shadow-sm shadow-black/[0.04]",
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          aria-hidden
        >
          <BadgePercentIcon className="size-6" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
              {badge}
            </span>
            <span className="truncate text-[11px] text-foreground/50">
              {servicesLine(offer, services)}
            </span>
          </div>
          <h3 className="truncate font-heading text-[15px] font-semibold leading-tight tracking-tight text-foreground">
            {offer.title}
          </h3>
          {description ? (
            <p className="line-clamp-2 text-[12px] leading-snug text-foreground/60">
              {description}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <OfferCodeChip code={offer.code} />
            {expiry ? (
              <p className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                <ClockIcon className="size-3 shrink-0" aria-hidden />
                Valid till {expiry}
              </p>
            ) : null}
            <OfferTermsDialog offer={offer} services={services} />
          </div>
        </div>
      </div>

      <Button
        type="button"
        size="md"
        className="mt-auto w-full"
        onClick={() => scrollToSalonServicesSection()}
      >
        {cta}
      </Button>
    </article>
  )
}

export function SalonOffersSection({
  offers,
  glammzoOffers = [],
  services = [],
  className,
  embedded = false,
}: SalonOffersSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const items = useMemo<UnifiedOfferItem[]>(
    () => [
      ...glammzoOffers.map((offer) => ({
        kind: "glammzo" as const,
        id: `glammzo-${offer.id}`,
        title: offer.title,
        offer,
      })),
      ...offers.map((offer) => ({
        kind: "salon" as const,
        id: offer.id,
        title: offer.title,
        offer,
      })),
    ],
    [glammzoOffers, offers],
  )

  const canScroll = items.length > 1
  const sectionCta =
    offers[0]?.ctaLabel?.trim() ||
    glammzoOffers[0]?.ctaLabel?.trim() ||
    "Book now"

  const syncActiveIndex = useCallback(() => {
    const container = scrollRef.current
    if (!container || items.length === 0) return

    const firstCard = container.querySelector<HTMLElement>("[data-offer-card]")
    if (!firstCard) return

    const stride = firstCard.offsetWidth + CARD_GAP_PX
    if (stride <= 0) return

    const index = Math.round(container.scrollLeft / stride)
    setActiveIndex(Math.min(Math.max(index, 0), items.length - 1))
  }, [items.length])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    container.addEventListener("scroll", syncActiveIndex, { passive: true })
    return () => container.removeEventListener("scroll", syncActiveIndex)
  }, [syncActiveIndex])

  useEffect(() => {
    setActiveIndex(0)
    scrollRef.current?.scrollTo({ left: 0, behavior: "instant" })
  }, [items])

  if (items.length === 0) return null

  return (
    <section className={cn("space-y-3", className)}>
      {embedded ? null : (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-eyebrow">Offers</p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
              Offers for you
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/65">
              Instant checkout discounts — enter the code in Promo code when you book.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => scrollToSalonServicesSection()}
          >
            {sectionCta}
          </Button>
        </div>
      )}

      {items.length === 1 ? (
        <div className="w-full max-w-[28rem]">
          {items[0]!.kind === "glammzo" ? (
            <GlammzoOfferCard offer={items[0]!.offer} />
          ) : (
            <OfferCard offer={items[0]!.offer} services={services} />
          )}
        </div>
      ) : (
        <div className="relative">
          <div
            ref={scrollRef}
            className={cn(
              "flex gap-3 overflow-x-auto scroll-smooth pb-1",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              "snap-x snap-mandatory",
            )}
            aria-roledescription="carousel"
            aria-label="Offers"
          >
            {items.map((item) => (
              <div
                key={item.id}
                data-offer-card
                className={cn("shrink-0 snap-start", CARD_WIDTH)}
              >
                {item.kind === "glammzo" ? (
                  <GlammzoOfferCard offer={item.offer} />
                ) : (
                  <OfferCard offer={item.offer} services={services} />
                )}
              </div>
            ))}
          </div>

          {canScroll ? (
            <div className="mt-2.5 flex items-center justify-center gap-1.5">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Go to ${item.title}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  onClick={() => {
                    const container = scrollRef.current
                    const firstCard =
                      container?.querySelector<HTMLElement>("[data-offer-card]")
                    const stride =
                      (firstCard?.offsetWidth ?? 448) + CARD_GAP_PX
                    container?.scrollTo({ left: index * stride, behavior: "smooth" })
                    setActiveIndex(index)
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === activeIndex
                      ? "w-4 bg-primary"
                      : "w-1.5 bg-foreground/20 hover:bg-foreground/35",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
