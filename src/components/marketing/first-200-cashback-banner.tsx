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

export function First200CashbackBanner() {
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
      <Container className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">
            Launch offer
          </p>
          <p className="mt-1 text-sm font-semibold sm:text-base">
            Book your first service and get {reward} cashback. Use code{" "}
            <span className="rounded-md bg-white/15 px-2 py-0.5 font-mono tracking-wide">
              {LAUNCH_PROMO_CODE}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="border border-white/25 bg-white/5 px-4 text-white hover:bg-white/12 hover:text-white"
            onClick={copyCode}
          >
            {copied ? (
              <>
                <CheckIcon className="size-3.5" />
                Copied
              </>
            ) : (
              <>
                <CopyIcon className="size-3.5" />
                Copy code
              </>
            )}
          </Button>
          <Button asChild size="sm" className="px-5">
            <Link href="/explore">
              Book now
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}
