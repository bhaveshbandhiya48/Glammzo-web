import { Button } from "@/components/ui/button"
import type { SalonOffer } from "@/types/salon"
import { cn } from "@/lib/utils"

type OfferEligibilityBannerProps = {
  offer: SalonOffer
  qualifies: boolean
  onBrowseEligible?: () => void
  className?: string
}

export function OfferEligibilityBanner({
  offer,
  qualifies,
  onBrowseEligible,
  className,
}: OfferEligibilityBannerProps) {
  if (qualifies) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-muted/25 px-4 py-3",
        className,
      )}
      role="status"
    >
      <p className="text-sm font-semibold text-foreground">No discounts available yet</p>
      <p className="mt-1 text-xs text-foreground/60">
        Add an eligible service to unlock {offer.code}.
      </p>
      {onBrowseEligible ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2.5"
          onClick={onBrowseEligible}
        >
          Browse eligible services
        </Button>
      ) : null}
    </div>
  )
}
