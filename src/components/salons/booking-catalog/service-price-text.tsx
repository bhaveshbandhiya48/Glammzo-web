import { formatInr } from "@/lib/salons/catalog-utils"
import { formatPriceWithUnit, parsePricingUnit } from "@/lib/salons/pricing-unit"
import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type ServicePriceTextProps = {
  service: Pick<SalonService, "price" | "compareAtPrice" | "pricingUnit">
  className?: string
  compareClassName?: string
}

/** Offer (payable) price with optional strikethrough original. */
export function ServicePriceText({
  service,
  className,
  compareClassName,
}: ServicePriceTextProps) {
  return (
    <span className={cn("tabular-nums", className)}>
      {formatPriceWithUnit(formatInr(service.price), parsePricingUnit(service.pricingUnit))}
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
