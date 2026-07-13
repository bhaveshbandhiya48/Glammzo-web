import Image from "next/image"
import Link from "next/link"
import { ArrowUpRightIcon, ClockIcon, MapPinIcon, PhoneIcon, StarIcon } from "lucide-react"

import { SalonDistance } from "@/components/salons/salon-distance"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Salon } from "@/types/salon"

export function BookingSalonSummary({ salon }: { salon: Salon }) {
  const coverImage = salon.coverImageUrl || salon.imageUrl
  const hasRating = salon.rating > 0 && salon.reviews > 0

  return (
    <article className="mt-6 overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm shadow-black/[0.03]">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <Image
          src={coverImage}
          alt={salon.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 420px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge
            variant={salon.isOpenNow ? "default" : "secondary"}
            className="rounded-full border-white/20 bg-black/35 text-[11px] text-white backdrop-blur-sm"
          >
            {salon.isOpenNow ? "Open now" : "Closed"}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{salon.area}</p>
            <h2 className="font-heading text-xl font-semibold tracking-tight">{salon.name}</h2>
            <SalonDistance
              salon={salon}
              className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm"
            />
          </div>
          {hasRating ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-background px-2.5 py-1 text-sm font-semibold">
              <StarIcon className="size-3.5 fill-primary text-primary" />
              {salon.rating.toFixed(1)}
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              New
            </span>
          )}
        </div>

        <dl className="space-y-2.5 border-t border-border/60 pt-3 text-sm">
          {salon.address.trim() ? (
            <div className="flex gap-2.5">
              <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
              <dd className="text-foreground/80">{salon.address}</dd>
            </div>
          ) : null}
          {salon.hours.trim() ? (
            <div className="flex gap-2.5">
              <ClockIcon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
              <dd className="text-foreground/80">{salon.hours}</dd>
            </div>
          ) : null}
          {salon.phone.trim() ? (
            <div className="flex gap-2.5">
              <PhoneIcon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
              <dd className="text-foreground/80">{salon.phone}</dd>
            </div>
          ) : null}
        </dl>

        <Button asChild variant="outline" size="sm" className="h-9 w-full rounded-full">
          <Link href={`/salons/${salon.id}`}>
            View full profile
            <ArrowUpRightIcon className="size-3.5" aria-hidden />
          </Link>
        </Button>
      </div>
    </article>
  )
}
