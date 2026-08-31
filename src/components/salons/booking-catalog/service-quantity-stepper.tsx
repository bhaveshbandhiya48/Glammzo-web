"use client"

import { QuantityStepper } from "@/components/ui/quantity-stepper"
import {
  maxQuantityForPricingUnit,
  parsePricingUnit,
  pricingUnitQuantityLabel,
  pricingUnitUsesQuantity,
  quantityForService,
} from "@/lib/salons/pricing-unit"
import type { SalonService } from "@/types/salon"

type ServiceQuantityStepperProps = {
  service: Pick<SalonService, "id" | "pricingUnit">
  quantity?: number
  onQuantityChange: (quantity: number) => void
  onRemove?: () => void
  compact?: boolean
  showLabel?: boolean
  className?: string
}

export function serviceUsesQuantity(service: Pick<SalonService, "pricingUnit">) {
  return pricingUnitUsesQuantity(parsePricingUnit(service.pricingUnit))
}

export function ServiceQuantityStepper({
  service,
  quantity,
  onQuantityChange,
  onRemove,
  compact = true,
  showLabel = false,
  className,
}: ServiceQuantityStepperProps) {
  const unit = parsePricingUnit(service.pricingUnit)
  if (!pricingUnitUsesQuantity(unit)) return null

  const value = quantityForService(service, { [service.id]: quantity ?? 1 })

  return (
    <QuantityStepper
      compact={compact}
      value={value}
      min={1}
      max={maxQuantityForPricingUnit(unit) ?? undefined}
      onChange={onQuantityChange}
      onRemove={onRemove}
      label={showLabel ? pricingUnitQuantityLabel(unit) : undefined}
      className={className}
    />
  )
}
