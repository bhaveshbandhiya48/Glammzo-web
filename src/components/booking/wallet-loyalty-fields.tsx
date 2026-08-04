"use client"

import { GiftIcon, SparklesIcon, WalletIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { formatInr } from "@/lib/salons/catalog-utils"
import {
  LOYALTY_DISCOUNT_CAP_PAISE,
  LOYALTY_VISITS_PER_FREE,
} from "@/lib/wallet/wallet-constants"

type WalletLoyaltyFieldsProps = {
  walletBalanceRupees: number
  freeServiceCredits: number
  useWallet: boolean
  useFreeService: boolean
  onUseWalletChange: (value: boolean) => void
  onUseFreeServiceChange: (value: boolean) => void
  walletAppliedRupees: number
  freeServiceAppliedRupees: number
  payAtSalonRupees: number
}

export function WalletLoyaltyFields({
  walletBalanceRupees,
  freeServiceCredits,
  useWallet,
  useFreeService,
  onUseWalletChange,
  onUseFreeServiceChange,
  walletAppliedRupees,
  freeServiceAppliedRupees,
  payAtSalonRupees,
}: WalletLoyaltyFieldsProps) {
  const hasWallet = walletBalanceRupees > 0
  const hasFree = freeServiceCredits > 0
  const hasRedeemOptions = hasWallet || hasFree
  const rewardCap = formatInr(LOYALTY_DISCOUNT_CAP_PAISE / 100)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/20 bg-[color-mix(in_oklab,var(--glam-coral)_8%,white)] p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <SparklesIcon className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Complete {LOYALTY_VISITS_PER_FREE} services → next one free or {rewardCap} off
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Finish this booking to earn your first credit toward the reward. Every completed
              service counts — hit {LOYALTY_VISITS_PER_FREE} and unlock a free service (or{" "}
              {rewardCap} off if it costs more).
            </p>
          </div>
        </div>
      </div>

      {hasRedeemOptions ? (
        <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Apply to this booking</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use wallet credit now. Pay the rest at the salon.
            </p>
          </div>

          {hasWallet ? (
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={useWallet}
                onCheckedChange={(checked) => onUseWalletChange(checked === true)}
                className="mt-0.5"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <WalletIcon className="size-3.5 text-primary" aria-hidden />
                  Use wallet ({formatInr(walletBalanceRupees)} available)
                </span>
                {useWallet && walletAppliedRupees > 0 ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Applying {formatInr(walletAppliedRupees)} to this booking
                  </span>
                ) : null}
              </span>
              {useWallet ? <input type="hidden" name="useWallet" value="1" /> : null}
            </label>
          ) : null}

          {hasFree ? (
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={useFreeService}
                onCheckedChange={(checked) => onUseFreeServiceChange(checked === true)}
                className="mt-0.5"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <GiftIcon className="size-3.5 text-primary" aria-hidden />
                  Use reward credit ({freeServiceCredits} left)
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Up to {rewardCap} off one service
                  {useFreeService && freeServiceAppliedRupees > 0
                    ? ` · applying ${formatInr(freeServiceAppliedRupees)}`
                    : ""}
                  . If the service is {rewardCap} or less, it is free.
                </span>
              </span>
              {useFreeService ? <input type="hidden" name="useFreeService" value="1" /> : null}
            </label>
          ) : null}

          <div className="border-t border-border/60 pt-3">
            <Label className="text-xs text-muted-foreground">Pay at salon</Label>
            <p className="font-heading text-xl font-semibold tabular-nums">
              {formatInr(payAtSalonRupees)}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
