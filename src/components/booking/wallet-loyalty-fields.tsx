"use client"

import { GiftIcon, WalletIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { formatInr } from "@/lib/salons/catalog-utils"
import { LOYALTY_DISCOUNT_CAP_PAISE } from "@/lib/wallet/wallet-constants"

type WalletLoyaltyFieldsProps = {
  walletBalanceRupees: number
  freeServiceCredits: number
  stampsTowardNextFree: number
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
  stampsTowardNextFree,
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

  if (!hasWallet && !hasFree && stampsTowardNextFree === 0) {
    return null
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Glammzo rewards</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Use wallet credit now. Pay the rest at the salon. Loyalty: {stampsTowardNextFree}/10 visits
          toward ₹{LOYALTY_DISCOUNT_CAP_PAISE / 100} off.
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
              Use loyalty credit ({freeServiceCredits} left)
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Up to {formatInr(LOYALTY_DISCOUNT_CAP_PAISE / 100)} off one service
              {useFreeService && freeServiceAppliedRupees > 0
                ? ` · applying ${formatInr(freeServiceAppliedRupees)}`
                : ""}
              . If the service is {formatInr(LOYALTY_DISCOUNT_CAP_PAISE / 100)} or less, it is free.
            </span>
          </span>
          {useFreeService ? <input type="hidden" name="useFreeService" value="1" /> : null}
        </label>
      ) : null}

      <div className="border-t border-border/60 pt-3">
        <Label className="text-xs text-muted-foreground">Pay at salon</Label>
        <p className="font-heading text-xl font-semibold tabular-nums">{formatInr(payAtSalonRupees)}</p>
      </div>
    </div>
  )
}
