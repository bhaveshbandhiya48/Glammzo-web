"use client"

import { formatInr } from "@/lib/salons/catalog-utils"
import { cn } from "@/lib/utils"

export type ProgressOfferProps = {
  amountToUnlock: number
  progress: number
  className?: string
}

export function ProgressOffer({
  amountToUnlock,
  progress,
  className,
}: ProgressOfferProps) {
  const remaining = Math.max(0, Math.round(amountToUnlock))
  const clamped = Math.max(0, Math.min(1, progress))

  if (remaining <= 0) return null

  return (
    <div className={cn("space-y-2", className)}>
      <p className="rounded-full bg-amber-500/10 px-3 py-2 text-center text-xs font-medium text-amber-950 dark:text-amber-100">
        Add <span className="font-semibold">{formatInr(remaining)}</span> more to avail this
        offer
      </p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-border/70"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped * 100)}
        aria-label={`Offer unlock progress ${Math.round(clamped * 100)} percent`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
    </div>
  )
}
