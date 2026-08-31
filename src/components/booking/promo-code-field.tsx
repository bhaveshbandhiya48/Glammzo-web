"use client"

import { useEffect, useState, useTransition } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CircleCheckIcon, Loader2Icon, TagIcon, XIcon } from "lucide-react"

import { validatePromoCodeAction } from "@/lib/bookings/promo-actions"
import { formatInr } from "@/lib/salons/catalog-utils"
import type { AppliedOfferDiscount } from "@/lib/salons/offer-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type CashbackClaim = {
  code: string
  cashbackRupees: number
  message: string
}

type PromoCodeFieldProps = {
  salonId: string
  serviceIds: string[]
  packageId?: string | null
  serviceQuantities?: Record<string, number>
  value: AppliedOfferDiscount | null
  onChange: (discount: AppliedOfferDiscount | null) => void
  onCashbackChange?: (claim: CashbackClaim | null) => void
  initialCode?: string
  className?: string
  hideLabel?: boolean
}

export type { CashbackClaim }

export function PromoCodeField({
  salonId,
  serviceIds,
  packageId = null,
  serviceQuantities,
  value,
  onChange,
  onCashbackChange,
  initialCode = "",
  className,
  hideLabel = false,
}: PromoCodeFieldProps) {
  const [code, setCode] = useState(value?.code ?? initialCode)
  const [error, setError] = useState<string | null>(null)
  const [cashback, setCashbackState] = useState<CashbackClaim | null>(null)
  const [isPending, startTransition] = useTransition()
  const [autoApplied, setAutoApplied] = useState(false)

  function setCashback(next: CashbackClaim | null) {
    setCashbackState(next)
    onCashbackChange?.(next)
  }

  useEffect(() => {
    if (autoApplied || value || cashback || !initialCode.trim() || serviceIds.length === 0) {
      return
    }

    setAutoApplied(true)
    startTransition(async () => {
      const result = await validatePromoCodeAction({
        salonId,
        code: initialCode,
        serviceIds,
        packageId,
        serviceQuantities,
      })

      if (!result.success) {
        setCode(initialCode.trim().toUpperCase())
        setError(result.error)
        return
      }

      if (result.kind === "discount") {
        setCode(result.discount.code)
        setCashback(null)
        onChange(result.discount)
        return
      }

      setCode(result.code)
      setCashback({
        code: result.code,
        cashbackRupees: result.cashbackRupees,
        message: result.message,
      })
      onChange(null)
    })
  }, [
    autoApplied,
    cashback,
    initialCode,
    onChange,
    packageId,
    salonId,
    serviceIds,
    value,
  ])

  // Drop launch cashback if cart drops below the minimum.
  useEffect(() => {
    if (!cashback) return

    startTransition(async () => {
      const result = await validatePromoCodeAction({
        salonId,
        code: cashback.code,
        serviceIds,
        packageId,
        serviceQuantities,
      })

      if (result.success && result.kind === "cashback") {
        setError(null)
        setCashback({
          code: result.code,
          cashbackRupees: result.cashbackRupees,
          message: result.message,
        })
        return
      }

      setCashback(null)
      setError(
        result.success
          ? "This code is no longer valid for your cart."
          : result.error,
      )
    })
  }, [cashback?.code, packageId, salonId, serviceIds.join("|"), JSON.stringify(serviceQuantities ?? {})])

  // Drop salon offer discount if cart services are no longer covered.
  useEffect(() => {
    if (!value) return

    startTransition(async () => {
      const result = await validatePromoCodeAction({
        salonId,
        code: value.code,
        serviceIds,
        packageId,
        serviceQuantities,
      })

      if (result.success && result.kind === "discount") {
        setError(null)
        onChange(result.discount)
        return
      }

      onChange(null)
      setError(
        result.success
          ? "Offer not applied — this service isn't covered."
          : result.error,
      )
    })
  }, [value?.code, packageId, salonId, serviceIds.join("|"), JSON.stringify(serviceQuantities ?? {})])

  function clearPromo() {
    setCode("")
    setError(null)
    setCashback(null)
    onChange(null)
  }

  function applyPromo() {
    const trimmed = code.trim()
    if (!trimmed) {
      clearPromo()
      return
    }

    if (serviceIds.length === 0) {
      setError("Add services to your cart before applying a promo code.")
      return
    }

    startTransition(async () => {
      const result = await validatePromoCodeAction({
        salonId,
        code: trimmed,
        serviceIds,
        packageId,
        serviceQuantities,
      })

      if (!result.success) {
        setError(result.error)
        setCashback(null)
        onChange(null)
        return
      }

      setError(null)

      if (result.kind === "discount") {
        setCashback(null)
        setCode(result.discount.code)
        onChange(result.discount)
        return
      }

      setCode(result.code)
      setCashback({
        code: result.code,
        cashbackRupees: result.cashbackRupees,
        message: result.message,
      })
      onChange(null)
    })
  }

  const isApplied = Boolean(value) || Boolean(cashback)
  const submittedCode = value?.code ?? cashback?.code ?? ""

  return (
    <div className={cn("space-y-2", className)}>
      {hideLabel ? null : (
        <Label htmlFor="promoCode" className="text-sm font-semibold text-foreground">
          Promo code
        </Label>
      )}

      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <TagIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="promoCode"
            value={code}
            onChange={(event) => {
              if (isApplied) return
              setCode(event.target.value.toUpperCase())
              if (error) setError(null)
            }}
            placeholder="Enter promo code"
            className="h-10 rounded-lg pl-9 text-sm uppercase"
            autoComplete="off"
            disabled={isPending || isApplied}
            readOnly={isApplied}
            aria-describedby={error ? "promoCode-error" : undefined}
          />
        </div>

        {submittedCode ? <input type="hidden" name="promoCode" value={submittedCode} /> : null}

        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            variant={isApplied ? "secondary" : "outline"}
            className={cn(
              "min-w-[6.5rem]",
              isApplied && "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50",
            )}
            onClick={applyPromo}
            disabled={isPending || serviceIds.length === 0 || isApplied}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
            ) : isApplied ? (
              <>
                <CircleCheckIcon className="size-4" aria-hidden />
                Applied
              </>
            ) : (
              "Apply"
            )}
          </Button>

          {isApplied ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearPromo}
              aria-label="Remove promo code"
            >
              <XIcon className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p id="promoCode-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key={`discount-${value.code}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-3 py-2.5"
            role="status"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <CircleCheckIcon className="size-4 shrink-0" aria-hidden />
              {value.code} applied
            </p>
            <p className="mt-1 text-sm text-emerald-900/80">{value.title}</p>
            <p className="mt-0.5 text-xs font-medium text-emerald-700">
              You saved {formatInr(value.discountAmount)}
            </p>
          </motion.div>
        ) : cashback ? (
          <motion.div
            key={`cashback-${cashback.code}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-3 py-2.5"
            role="status"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <CircleCheckIcon className="size-4 shrink-0" aria-hidden />
              {cashback.code} claimed
            </p>
            <p className="mt-1 text-sm text-emerald-900/80">{cashback.message}</p>
            <p className="mt-0.5 text-xs font-medium text-emerald-700">
              No amount is deducted at checkout. Cashback goes to your wallet after the visit.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
