"use client"

import { useMemo } from "react"
import Link from "next/link"
import { MapPinIcon, StarIcon } from "lucide-react"

import type { Salon } from "@/types/salon"
import { FavoriteSalonButton } from "@/components/favorites/favorite-salon-button"
import { useExploreDistanceOrigin } from "@/hooks/use-explore-distance-origin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SalonCardImageSlider } from "@/components/salons/salon-card-image-slider"
import { computeSalonDistanceKm } from "@/lib/explore-distance"
import { formatDistanceKm } from "@/lib/maps/haversine"
import { getSalonCardImages } from "@/lib/salons/salon-card-images"
import { cn } from "@/lib/utils"

export function SalonCard({
  salon,
  className,
  favorite,
  selected = false,
  onSelect,
  density = "default",
}: {
  salon: Salon
  className?: string
  favorite?: {
    authenticated: boolean
    initialFavorited: boolean
  }
  /** Highlights the card when used in map sidebar selection. */
  selected?: boolean
  /** When set, tapping the image area selects the salon instead of navigating. */
  onSelect?: () => void
  /** Tighter layout for map sidebar grids. */
  density?: "default" | "compact"
}) {
  const origin = useExploreDistanceOrigin({})

  const distanceKm = useMemo(() => {
    if (salon.distanceKm > 0) {
      return salon.distanceKm
    }

    return computeSalonDistanceKm(salon, origin) ?? 0
  }, [origin, salon])

  const distanceLabel = distanceKm > 0 ? formatDistanceKm(distanceKm) : null
  const compact = density === "compact"
  const cardImages = useMemo(() => getSalonCardImages(salon), [salon])

  return (
    <article
      className={cn(
        "group relative overflow-hidden border border-border/70 bg-card shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03] transition-[box-shadow,transform] duration-300 [&_a]:cursor-pointer",
        compact
          ? "rounded-lg hover:shadow-md hover:shadow-black/[0.06]"
          : "rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.08]",
        selected && "border-primary/40 ring-2 ring-primary/30",
        className
      )}
    >
      {favorite ? (
        <div className={cn("absolute z-20", compact ? "right-2 top-2" : "right-4 top-4")}>
          <FavoriteSalonButton
            salonId={salon.id}
            crmSalonId={salon.crmSalonId}
            initialFavorited={favorite.initialFavorited}
            authenticated={favorite.authenticated}
            className={cn("bg-background/90 backdrop-blur-sm", compact && "size-8")}
          />
        </div>
      ) : null}
      <SalonCardImage
        salon={salon}
        images={cardImages}
        distanceLabel={distanceLabel}
        compact={compact}
        href={onSelect ? undefined : `/salons/${salon.id}`}
        onActivate={onSelect}
      />
      <div className={cn("border-t border-border/60", compact ? "p-3" : "p-5")}>
        <p className={cn("text-foreground/60", compact ? "text-xs" : "text-sm")}>
          From <span className="font-heading font-semibold text-foreground">₹{salon.priceFrom}</span>
          {" · "}
          {salon.reviews > 0
            ? `${salon.reviews.toLocaleString()} reviews`
            : "New on Glammzo"}
        </p>
        <Button
          asChild
          size={compact ? "sm" : "md"}
          className={cn("w-full", compact ? "mt-2" : "mt-4")}
        >
          <Link href={`/salons/${salon.id}`}>View details</Link>
        </Button>
      </div>
    </article>
  )
}

function SalonCardImage({
  salon,
  images,
  distanceLabel,
  compact = false,
  href,
  onActivate,
}: {
  salon: Salon
  images: string[]
  distanceLabel: string | null
  compact?: boolean
  href?: string
  onActivate?: () => void
}) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden",
        (href || onActivate) &&
          "cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
      )}
    >
      <SalonCardImageSlider
        images={images}
        salonName={salon.name}
        compact={compact}
        href={href}
        onActivate={onActivate}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      <div
        className={cn(
          "pointer-events-none absolute flex items-center gap-2",
          compact ? "left-2 top-2" : "left-4 top-4",
        )}
      >
        <Badge
          variant={salon.isOpenNow ? "default" : "secondary"}
          className={cn("rounded-full shadow-sm", compact && "px-2 py-0 text-[10px]")}
        >
          {salon.isOpenNow ? "Open now" : "Closed"}
        </Badge>
      </div>
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0",
          compact ? "pt-10" : "pt-14",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-transparent transition-opacity group-hover:from-black/95",
            compact ? "via-black/70" : "via-black/60",
          )}
        />
        <div className={cn("relative", compact ? "p-3" : "p-5")}>
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p
                className={cn(
                  "flex items-center gap-1 font-medium text-white/90",
                  compact ? "text-[10px] leading-tight" : "text-xs",
                )}
              >
                <MapPinIcon className={cn("shrink-0", compact ? "size-3" : "size-3.5")} />
                <span className="truncate">
                  {salon.area}
                  {distanceLabel ? ` · ${distanceLabel}` : null}
                </span>
              </p>
              <h3
                className={cn(
                  "mt-0.5 truncate font-heading font-semibold text-white drop-shadow-sm",
                  compact ? "text-base" : "text-xl sm:text-2xl",
                )}
              >
                {salon.name}
              </h3>
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full bg-black/35 font-medium text-white backdrop-blur-sm",
                compact ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-sm",
              )}
            >
              <StarIcon className={cn("fill-current", compact ? "size-3" : "size-3.5")} />
              {salon.rating > 0 ? salon.rating.toFixed(1) : "New"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
