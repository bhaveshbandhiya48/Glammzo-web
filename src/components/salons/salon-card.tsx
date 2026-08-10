"use client"

import { useMemo } from "react"
import Link from "next/link"
import { MapPinIcon, StarIcon } from "lucide-react"

import type { Salon } from "@/types/salon"
import { FavoriteSalonButton } from "@/components/favorites/favorite-salon-button"
import { useExploreDistanceOrigin } from "@/hooks/use-explore-distance-origin"
import { useSalonCatalog } from "@/hooks/use-salon-catalog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SalonOfferDiscountBadge } from "@/components/salons/offers/service-offer-badge"
import { SalonCardImageSlider } from "@/components/salons/salon-card-image-slider"
import { computeSalonDistanceKm } from "@/lib/explore-distance"
import { formatDistanceKmShort } from "@/lib/maps/haversine"
import { resolveMostBookedSalonIds } from "@/lib/salons/most-booked"
import { getSalonCardImages } from "@/lib/salons/salon-card-images"
import { pickBestSalonOffer } from "@/lib/salons/offer-utils"
import { cn } from "@/lib/utils"

export function SalonCard({
  salon,
  className,
  favorite,
  selected = false,
  onSelect,
  density = "default",
  imagePriority = false,
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
  /** Mark the card image as LCP-critical (first above-the-fold card). */
  imagePriority?: boolean
}) {
  const origin = useExploreDistanceOrigin({})
  const { salons: catalogSalons } = useSalonCatalog()

  // Always measure from the live origin (GPS / selected place), not a stale salon.distanceKm.
  const distanceKm = useMemo(
    () => computeSalonDistanceKm(salon, origin),
    [origin, salon],
  )

  const distanceLabel =
    distanceKm != null && Number.isFinite(distanceKm) ? formatDistanceKmShort(distanceKm) : null
  const compact = density === "compact"
  const cardImages = useMemo(() => getSalonCardImages(salon), [salon])
  const bestOffer = useMemo(
    () => pickBestSalonOffer(salon.offers ?? []),
    [salon.offers],
  )
  const isMostBooked = useMemo(() => {
    const peers = catalogSalons.length > 0 ? catalogSalons : [salon]
    return resolveMostBookedSalonIds(peers, origin).has(salon.id)
  }, [catalogSalons, origin, salon])

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
        isMostBooked={isMostBooked}
        href={onSelect ? undefined : `/salons/${salon.id}`}
        onActivate={onSelect}
        priority={imagePriority}
      />
      <div className={cn("border-t border-border/60", compact ? "p-3" : "p-5")}>
        {salon.businessType ? (
          <p
            className={cn(
              "font-semibold uppercase tracking-[0.14em] text-foreground/45",
              compact ? "mb-1.5 text-[10px]" : "mb-2 text-[11px]",
            )}
          >
            {salon.businessType}
          </p>
        ) : null}
        <div
          className={cn(
            "flex items-center justify-between gap-2",
            compact ? "text-xs" : "text-sm",
          )}
        >
          <p className="min-w-0 text-foreground/60">
            From{" "}
            <span className="font-heading font-semibold text-foreground">
              ₹{salon.priceFrom}
            </span>
          </p>
          {bestOffer ? (
            <SalonOfferDiscountBadge
              offer={bestOffer}
              className={cn("shrink-0", compact && "px-1.5 py-0 text-[10px]")}
            />
          ) : null}
        </div>
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
  isMostBooked = false,
  href,
  onActivate,
  priority = false,
}: {
  salon: Salon
  images: string[]
  distanceLabel: string | null
  compact?: boolean
  isMostBooked?: boolean
  href?: string
  onActivate?: () => void
  priority?: boolean
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
        priority={priority}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      <div
        className={cn(
          "pointer-events-none absolute flex flex-wrap items-center gap-1.5",
          compact
            ? "left-2 top-2 max-w-[calc(100%-2.5rem)]"
            : "left-4 top-4 max-w-[calc(100%-4rem)]",
        )}
      >
        <Badge
          variant={salon.isOpenNow ? "default" : "secondary"}
          className={cn("rounded-full shadow-sm", compact && "px-2 py-0 text-[10px]")}
        >
          {salon.isOpenNow ? "Open now" : "Closed"}
        </Badge>
        {isMostBooked ? (
          <Badge
            variant="secondary"
            className={cn(
              "rounded-full border-0 bg-[#F5E6A8] text-foreground shadow-sm hover:bg-[#F5E6A8]",
              compact && "px-2 py-0 text-[10px]",
            )}
          >
            Most booked
          </Badge>
        ) : null}
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
                <span className="min-w-0 truncate">{salon.area}</span>
                {distanceLabel ? (
                  <span className="shrink-0 whitespace-nowrap">· {distanceLabel}</span>
                ) : null}
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
              {salon.reviews > 0 ? (
                <span className="text-white/75">({salon.reviews.toLocaleString()})</span>
              ) : null}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
