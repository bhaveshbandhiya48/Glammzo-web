import { formatInr } from "@/lib/salons/catalog-utils"
import type { BookingPriceBreakdown } from "@/lib/bookings/utils"
import { cn } from "@/lib/utils"

export type BookingPriceBreakdownCardProps = {
  breakdown: BookingPriceBreakdown
  payableLabel?: string
  className?: string
  /** Compact spacing for appointment list cards. */
  compact?: boolean
}

function Row({
  label,
  value,
  tone = "default",
  strong = false,
}: {
  label: string
  value: string
  tone?: "default" | "savings" | "payable"
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={cn(
          "text-sm",
          tone === "savings" && "text-emerald-700",
          tone === "payable" && "text-foreground",
          tone === "default" && "text-foreground/55",
          strong && "font-semibold text-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums text-sm",
          tone === "savings" && "font-medium text-emerald-700",
          tone === "payable" && "font-heading text-xl font-semibold text-foreground",
          tone === "default" && "font-medium text-foreground",
          strong && tone === "default" && "font-semibold",
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function BookingPriceBreakdownCard({
  breakdown,
  payableLabel = "Pay at salon",
  className,
  compact = false,
}: BookingPriceBreakdownCardProps) {
  const { subtotal, promoCode, promoDiscount, loyaltyDiscount, walletUsed, payable, hasAdjustments } =
    breakdown

  if (!hasAdjustments) {
    return (
      <div className={cn(compact ? "space-y-1" : "space-y-1.5", className)}>
        <Row label="You pay" value={formatInr(payable)} tone="payable" />
        {payableLabel ? (
          <p className="text-xs font-medium text-foreground/55">{payableLabel}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-muted/25",
        compact ? "space-y-2 px-3.5 py-3" : "space-y-2.5 px-4 py-3.5",
        className,
      )}
    >
      <Row label="Item total" value={formatInr(subtotal)} />
      {promoDiscount > 0 ? (
        <Row
          label={promoCode ? `Promo (${promoCode})` : "Promo discount"}
          value={`−${formatInr(promoDiscount)}`}
          tone="savings"
        />
      ) : null}
      {loyaltyDiscount > 0 ? (
        <Row
          label="Loyalty credit"
          value={`−${formatInr(loyaltyDiscount)}`}
          tone="savings"
        />
      ) : null}
      {walletUsed > 0 ? (
        <Row
          label="Wallet"
          value={`−${formatInr(walletUsed)}`}
          tone="savings"
        />
      ) : null}
      <div className="border-t border-border/50 pt-2.5">
        <Row label="You pay" value={formatInr(payable)} tone="payable" />
        {payableLabel ? (
          <p className="mt-1 text-xs font-medium text-foreground/55">{payableLabel}</p>
        ) : null}
      </div>
    </div>
  )
}
