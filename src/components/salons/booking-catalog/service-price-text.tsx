import { formatInr } from "@/lib/salons/catalog-utils"
import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type ServicePriceTextProps = {
  service: Pick<SalonService, "price" | "compareAtPrice">
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
      {formatInr(service.price)}
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
