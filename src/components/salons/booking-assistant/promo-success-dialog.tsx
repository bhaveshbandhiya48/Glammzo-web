"use client"

import { SparklesIcon, TagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatInr } from "@/lib/salons/catalog-utils"
import type { AppliedOfferDiscount } from "@/lib/salons/offer-utils"
import { cn } from "@/lib/utils"

export type PromoSuccessDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  discount: AppliedOfferDiscount | null
  /** Wallet cashback after visit (Glammzo), not checkout discount. */
  rewardKind?: "discount" | "cashback"
}

function formatDiscountLabel(discount: AppliedOfferDiscount) {
  if (discount.discountType === "percent") {
    return `${discount.discountValue}% off`
  }
  return `${formatInr(discount.discountValue)} off`
}

export function PromoSuccessDialog({
  open,
  onOpenChange,
  discount,
  rewardKind = "discount",
}: PromoSuccessDialogProps) {
  if (!discount) return null

  const savings = Math.round(discount.discountAmount)
  const isCashback = rewardKind === "cashback"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-0 p-0 sm:max-w-md">
        <div className="relative overflow-hidden bg-background px-6 pb-6 pt-8 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              backgroundImage: isCashback
                ? "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--foreground) 18%, transparent), transparent 42%), radial-gradient(circle at 80% 10%, #94a3b855, transparent 36%)"
                : "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--primary) 28%, transparent), transparent 42%), radial-gradient(circle at 80% 10%, #ffd16655, transparent 36%), radial-gradient(circle at 70% 80%, #06d6a033, transparent 40%)",
            }}
          />

          <div
            className={cn(
              "relative mx-auto mb-4 flex size-16 items-center justify-center rounded-full",
              isCashback
                ? "bg-foreground/10 text-foreground"
                : "bg-primary/10 text-primary",
            )}
          >
            <SparklesIcon className="size-7" aria-hidden />
          </div>

          <DialogHeader className="relative gap-2 space-y-0 text-center">
            <p
              className={cn(
                "text-xs font-semibold tracking-[0.14em] uppercase",
                isCashback ? "text-foreground/70" : "text-primary",
              )}
            >
              Congratulations
            </p>
            <DialogTitle className="font-heading text-2xl font-semibold tracking-tight">
              {isCashback
                ? `You got ${formatInr(savings)} cashback`
                : `You got ${formatInr(savings)} off`}
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/60">
              {discount.title}
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-5 space-y-2 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3.5 text-left">
            <div className="flex items-center gap-2">
              <TagIcon
                className={cn("size-4", isCashback ? "text-foreground" : "text-primary")}
                aria-hidden
              />
              <code className="font-mono text-sm font-semibold tracking-wide text-foreground">
                {discount.code}
              </code>
            </div>
            <p className="text-sm text-foreground">
              {isCashback
                ? `${formatInr(discount.discountValue)} wallet cashback · Code ${discount.code}`
                : `${formatDiscountLabel(discount)} · Code ${discount.code}`}
            </p>
            <p className="text-xs text-foreground/55">
              {isCashback
                ? "Credited to your wallet after your visit. Booking total stays the same."
                : `New total ${formatInr(discount.finalTotal)} (was ${formatInr(discount.subtotal)})`}
            </p>
          </div>

          <Button
            type="button"
            className={cn(
              "relative mt-5 w-full",
              isCashback &&
                "bg-foreground text-background shadow-none hover:bg-foreground/90 hover:shadow-none",
            )}
            onClick={() => onOpenChange(false)}
          >
            Awesome
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
