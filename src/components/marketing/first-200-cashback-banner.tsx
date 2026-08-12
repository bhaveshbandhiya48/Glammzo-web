"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRightIcon, CheckIcon, CopyIcon } from "lucide-react"

import {
  LAUNCH_PROMO_ACTIVE,
  LAUNCH_PROMO_CODE,
  LAUNCH_CASHBACK_RUPEES,
} from "@/lib/marketing/launch-promo"
import { formatInr } from "@/lib/salons/catalog-utils"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"

type First200CashbackBannerProps = {
  /** Hide the reserve CTA when the user is already on Explore. */
  showBookCta?: boolean
}

export function First200CashbackBanner({ showBookCta = true }: First200CashbackBannerProps) {
  const [copied, setCopied] = useState(false)

  if (!LAUNCH_PROMO_ACTIVE) {
    return null
  }

  const reward = formatInr(LAUNCH_CASHBACK_RUPEES)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(LAUNCH_PROMO_CODE)
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
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">
            Launch offer
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug sm:text-base">
            Book your first service and get {reward} cashback. Use code{" "}
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-0.5 font-mono tracking-wide transition-colors hover:bg-white/25"
              aria-label={copied ? "Code copied" : `Copy code ${LAUNCH_PROMO_CODE}`}
            >
              {LAUNCH_PROMO_CODE}
              {copied ? (
                <CheckIcon className="size-3.5 shrink-0 text-white/80" aria-hidden />
              ) : (
                <CopyIcon className="size-3.5 shrink-0 text-white/70" aria-hidden />
              )}
            </button>
          </p>
          <p className="mt-1.5 text-[10px] leading-none text-white/45">
            <Link
              href="/terms"
              className="underline-offset-2 transition-colors hover:text-white/70 hover:underline"
            >
              T&amp;Cs apply
            </Link>
          </p>
        </div>
        {showBookCta ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="px-5">
              <Link href="/explore">
                Reserve Your Chair Now
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </Button>
          </div>
        ) : null}
      </Container>
    </section>
  )
}
