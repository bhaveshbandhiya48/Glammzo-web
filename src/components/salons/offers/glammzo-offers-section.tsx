"use client"

import { useState } from "react"
import {
  CheckIcon,
  ClockIcon,
  CopyIcon,
  SparklesIcon,
  WalletIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { GlammzoOffer } from "@/lib/marketing/glammzo-offers"
import { formatOfferExpiry } from "@/lib/salons/offer-utils"
import { scrollToSalonServicesSection } from "@/lib/salons/salon-detail-scroll"
import { cn } from "@/lib/utils"

function GlammzoCodeChip({ code }: { code: string }) {
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
        "inline-flex items-center gap-1.5 rounded-lg border border-dashed border-foreground/40",
        "bg-foreground/[0.06] px-2 py-1 font-mono text-[11px] font-semibold tracking-[0.06em] text-foreground",
        "transition-colors hover:border-foreground/60 hover:bg-foreground/10",
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

function GlammzoTermsDialog({ offer }: { offer: GlammzoOffer }) {
  const description =
    typeof offer.description === "string" ? offer.description.trim() : ""
  const terms: string[] = ["Glammzo platform offer", "Once per customer"]

  if (offer.cashbackRupees > 0) {
    terms.push(
      `₹${offer.cashbackRupees} wallet cashback credited after your visit`,
    )
  }
  if (offer.minOrderRupees > 0) {
    terms.push(`Minimum booking ₹${offer.minOrderRupees}`)
  }
  if (offer.promoCode) {
    terms.push(`Apply code ${offer.promoCode} at checkout`)
  }
  const expiry = formatOfferExpiry(offer.endsAt)
  if (expiry) terms.push(`Valid till ${expiry}`)
  if (description) terms.push(description)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-[11px] font-medium text-foreground/55 underline-offset-2 hover:text-foreground hover:underline"
        >
          T&amp;C applied
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{offer.title}</DialogTitle>
          <DialogDescription>
            Terms for this Glammzo offer.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm text-foreground/75">
          {terms.map((term) => (
            <li key={term} className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/40" />
              <span>{term}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

function badgeLabel(offer: GlammzoOffer) {
  if (offer.cashbackRupees > 0) return `₹${offer.cashbackRupees} CASHBACK`
  return "GLAMMZO"
}

function scopeLine(offer: GlammzoOffer) {
  if (offer.cashbackRupees > 0) return "Wallet cashback"
  return "Glammzo offer"
}

export function GlammzoOfferCard({ offer }: { offer: GlammzoOffer }) {
  const expiry = formatOfferExpiry(offer.endsAt)
  const description =
    typeof offer.description === "string"
      ? offer.description.trim()
      : typeof offer.subtitle === "string"
        ? offer.subtitle.trim()
        : ""
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
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-background"
          aria-hidden
        >
          <SparklesIcon className="size-6" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-foreground uppercase">
              {badgeLabel(offer)}
            </span>
            <span className="truncate text-[11px] text-foreground/50">
              {scopeLine(offer)}
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
            {offer.promoCode ? <GlammzoCodeChip code={offer.promoCode} /> : null}
            {expiry ? (
              <p className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/70">
                <ClockIcon className="size-3 shrink-0" aria-hidden />
                Valid till {expiry}
              </p>
            ) : offer.cashbackRupees > 0 ? (
              <p className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/70">
                <WalletIcon className="size-3 shrink-0" aria-hidden />
                After visit
                {offer.minOrderRupees > 0
                  ? ` · min ₹${offer.minOrderRupees}`
                  : ""}
              </p>
            ) : null}
            <GlammzoTermsDialog offer={offer} />
          </div>
        </div>
      </div>

      <Button
        type="button"
        size="md"
        className={cn(
          "mt-auto w-full bg-foreground text-background",
          "shadow-none hover:bg-foreground/90 hover:shadow-none",
          "focus-visible:ring-foreground/30",
        )}
        onClick={() => scrollToSalonServicesSection()}
      >
        {cta}
      </Button>
    </article>
  )
}

/** @deprecated Prefer SalonOffersSection with glammzoOffers — kept for HMR-safe imports. */
export function GlammzoOffersSection({
  offers,
  className,
}: {
  offers: GlammzoOffer[]
  className?: string
}) {
  if (offers.length === 0) return null
  return (
    <div className={cn("flex gap-3 overflow-x-auto", className)}>
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="w-[min(100%,26rem)] shrink-0 sm:w-[28rem]"
        >
          <GlammzoOfferCard offer={offer} />
        </div>
      ))}
    </div>
  )
}
