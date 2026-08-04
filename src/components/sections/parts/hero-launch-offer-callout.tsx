"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon, TagIcon } from "lucide-react"

import {
  LAUNCH_CASHBACK_RUPEES,
  LAUNCH_PROMO_ACTIVE,
  LAUNCH_PROMO_CODE,
} from "@/lib/marketing/launch-promo"
import { formatInr } from "@/lib/salons/catalog-utils"
import { cn } from "@/lib/utils"

type HeroLaunchOfferCalloutProps = {
  className?: string
}

export function HeroLaunchOfferCallout({ className }: HeroLaunchOfferCalloutProps) {
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
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-primary/15",
        "bg-[color-mix(in_oklab,var(--glam-coral)_8%,white)] px-3 py-2",
        className,
      )}
    >
      <TagIcon className="size-3.5 shrink-0 text-primary" aria-hidden />

      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[13px] font-medium text-primary">
          Book your first service and get {reward} cashback
        </p>
        <p className="mt-0.5 text-xs font-semibold text-foreground">
          Code: <span className="font-mono tracking-wide">{LAUNCH_PROMO_CODE}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={copyCode}
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/15 bg-white/80 px-2 py-0.5",
          "text-[10px] font-semibold text-primary transition-colors hover:bg-white",
        )}
      >
        {copied ? (
          <>
            <CheckIcon className="size-2.5" aria-hidden />
            Copied
          </>
        ) : (
          <>
            <CopyIcon className="size-2.5" aria-hidden />
            Copy
          </>
        )}
      </button>
    </div>
  )
}
