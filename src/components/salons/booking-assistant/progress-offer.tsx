"use client"

import { formatInr } from "@/lib/salons/catalog-utils"
import { cn } from "@/lib/utils"

export type ProgressOfferProps = {
  amountToUnlock: number
  progress: number
  rewardLabel: string
  className?: string
}

export function ProgressOffer({
  amountToUnlock,
  progress,
  rewardLabel,
  className,
}: ProgressOfferProps) {
  const clamped = Math.max(0, Math.min(1, progress))

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs leading-relaxed text-foreground/60">
        Spend <span className="font-semibold text-foreground">{formatInr(amountToUnlock)}</span> more
        to unlock {rewardLabel}
      </p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-border/70"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped * 100)}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
    </div>
  )
}
