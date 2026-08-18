"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  eligibleServicesForOffer,
  formatOfferExpiry,
} from "@/lib/salons/offer-utils"
import { scrollToSalonServicesSection } from "@/lib/salons/salon-detail-scroll"
import type { SalonOffer, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type OfferTermRow = {
  label: string
  indent?: boolean
}

function offerAppliesToAllServices(offer: SalonOffer, services: SalonService[]) {
  if (offer.appliesTo === "all_services") return true
  if (services.length === 0) return false
  const eligible = eligibleServicesForOffer(offer, services)
  return eligible.length > 0 && eligible.length === services.length
}

function discountBadgeLabel(offer: SalonOffer) {
  if (offer.discountType === "percent") {
    return `${offer.discountValue}% OFF`
  }
  return `₹${offer.discountValue} OFF`
}

function buildOfferTerms(offer: SalonOffer, services: SalonService[]): OfferTermRow[] {
  const items: OfferTermRow[] = [{ label: "Once per customer" }]

  items.push({
    label:
      offer.customerEligibility === "new_customers_only"
        ? "New customers only"
        : "Available to all customers",
  })

  if (offer.minOrderRupees != null && offer.minOrderRupees > 0) {
    items.push({ label: `Minimum booking ₹${offer.minOrderRupees}` })
  }

  if (offerAppliesToAllServices(offer, services)) {
    items.push({ label: "Applied to all services" })
  } else {
    const eligible = eligibleServicesForOffer(offer, services)
    if (eligible.length === 0) {
      items.push({ label: "Applies to selected services" })
    } else {
      items.push({
        label: `Applies to ${eligible.length} service${eligible.length === 1 ? "" : "s"}`,
      })
      for (const service of eligible) {
        items.push({ label: service.name, indent: true })
      }
    }
  }

  const expiry = formatOfferExpiry(offer.endsAt)
  if (expiry) {
    items.push({ label: `Valid till ${expiry}` })
  }

  const freeform = typeof offer.terms === "string" ? offer.terms.trim() : ""
  if (freeform) {
    for (const line of freeform.split(/\n+/)) {
      const cleaned = line.trim().replace(/^[-•*]\s*/, "")
      if (cleaned) items.push({ label: cleaned })
    }
  }

  return items
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

export function OfferTermsDialog({
  offer,
  services,
}: {
  offer: SalonOffer
  services: SalonService[]
}) {
  const terms = buildOfferTerms(offer, services)
  const badge = discountBadgeLabel(offer)
  const description =
    typeof offer.description === "string" ? offer.description.trim() : ""

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-[11px] font-medium text-primary underline-offset-2 hover:underline"
        >
          T&amp;C applied
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="gap-1 border-b border-border/60 px-5 py-4 text-left">
          <DialogTitle className="font-heading text-lg">
            Terms &amp; conditions
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground/60">
            {offer.title} · {badge}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(70vh,28rem)] space-y-4 overflow-y-auto px-5 py-4">
          {description ? (
            <p className="text-sm leading-relaxed text-foreground/70">{description}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
            <span className="text-[11px] font-medium text-foreground/50">Code</span>
            <OfferCodeChip code={offer.code} />
          </div>

          <ul className="space-y-2.5">
            {terms.map((row, index) => {
              const label = String(row.label ?? "")
              if (!label) return null

              return (
                <li
                  key={`${index}-${label}`}
                  className={cn(
                    "flex items-start gap-2.5 text-sm leading-snug text-foreground/80",
                    row.indent && "pl-6 text-[13px] text-foreground/70",
                  )}
                >
                  {row.indent ? (
                    <span
                      className="mt-1.5 size-1 shrink-0 rounded-full bg-foreground/35"
                      aria-hidden
                    />
                  ) : (
                    <CheckIcon
                      className="mt-0.5 size-3.5 shrink-0 text-primary"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  )}
                  <span>{label}</span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="border-t border-border/60 px-5 py-4">
          <Button
            type="button"
            className="w-full"
            onClick={() => scrollToSalonServicesSection()}
          >
            {offer.ctaLabel?.trim() || "Book now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
