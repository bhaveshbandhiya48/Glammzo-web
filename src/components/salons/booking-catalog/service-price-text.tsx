import { formatInr, resolveServiceOptionPrice } from "@/lib/salons/catalog-utils"
import { formatPriceWithUnit, parsePricingUnit } from "@/lib/salons/pricing-unit"
import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type ServicePriceTextProps = {
  service: Pick<SalonService, "price" | "compareAtPrice" | "pricingUnit" | "priceOptions">
  className?: string
  compareClassName?: string
  /** Show the selected option amount instead of the catalog “from” price. */
  selectedOptionId?: string | null
  /** Booking cart / checkout: payable amount only, never “onwards”. */
  finalPrice?: boolean
}

/** Offer (payable) price with optional strikethrough original. */
export function ServicePriceText({
  service,
  className,
  compareClassName,
  selectedOptionId,
  finalPrice = false,
}: ServicePriceTextProps) {
  const hasOptions = (service.priceOptions?.length ?? 0) >= 2
  const selected = service.priceOptions?.find((option) => option.id === selectedOptionId)
  const amount = selected?.price ?? (finalPrice ? resolveServiceOptionPrice(service, selectedOptionId) : service.price)
  const showOnwards = !finalPrice && hasOptions && !selected

  return (
    <span className={cn("tabular-nums", className)}>
      {formatPriceWithUnit(formatInr(amount), parsePricingUnit(service.pricingUnit))}
      {showOnwards ? " onwards" : null}
      {service.compareAtPrice != null ? (
        <>
          {" "}
          <span
            className={cn(
              "text-foreground/45 line-through",
              compareClassName,
            )}
          >
            {formatInr(service.compareAtPrice)}
          </span>
        </>
      ) : null}
    </span>
  )
}
