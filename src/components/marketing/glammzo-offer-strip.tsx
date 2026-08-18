"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRightIcon, CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"
import type { GlammzoOffer } from "@/lib/marketing/glammzo-offers"

type GlammzoOfferStripProps = {
  offer: GlammzoOffer
  showBookCta?: boolean
}

export function GlammzoOfferStrip({
  offer,
  showBookCta = true,
}: GlammzoOfferStripProps) {
  const [copied, setCopied] = useState(false)
  const href = offer.ctaHref?.trim() || "/explore"
  const cta = offer.ctaLabel?.trim() || "Explore"
  const code = offer.promoCode?.trim() || null

  async function copyCode() {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="border-b border-border/50 bg-foreground text-background">
      <Container className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-4">
        <div className="min-w-0">
          {offer.eyebrow ? (
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">
              {offer.eyebrow}
            </p>
          ) : (
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">
              Glammzo offer
            </p>
          )}
          <p className="mt-1 text-sm font-semibold leading-snug sm:text-base">
            {offer.webStripText}
            {code ? (
              <>
                {" "}
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-0.5 font-mono tracking-wide transition-colors hover:bg-white/25"
                  aria-label={copied ? "Code copied" : `Copy code ${code}`}
                >
                  {code}
                  {copied ? (
                    <CheckIcon className="size-3.5 shrink-0 text-white/80" aria-hidden />
                  ) : (
                    <CopyIcon className="size-3.5 shrink-0 text-white/70" aria-hidden />
                  )}
                </button>
              </>
            ) : null}
          </p>
        </div>
        {showBookCta ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="px-5">
              <Link href={href}>
                {cta}
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </Button>
          </div>
        ) : null}
      </Container>
    </section>
  )
}
