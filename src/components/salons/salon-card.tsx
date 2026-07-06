import Image from "next/image"
import Link from "next/link"
import { MapPinIcon, StarIcon } from "lucide-react"

import type { Salon } from "@/types/salon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SalonCard({ salon, className }: { salon: Salon; className?: string }) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.08] [&_a]:cursor-pointer",
        className
      )}
    >
      <Link href={`/salons/${salon.id}`} className="relative block overflow-hidden">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={salon.imageUrl}
            alt={salon.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
          <div className="absolute left-4 top-4">
            <Badge
              variant={salon.isOpenNow ? "default" : "secondary"}
              className="rounded-full shadow-sm"
            >
              {salon.isOpenNow ? "Open now" : "Closed"}
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-xs font-medium text-white/75">
                  <MapPinIcon className="size-3.5 shrink-0" />
                  {salon.area} · {salon.distanceKm.toFixed(1)} km
                </p>
                <h3 className="mt-1 truncate font-heading text-xl font-semibold text-white sm:text-2xl">
                  {salon.name}
                </h3>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-sm font-medium text-white backdrop-blur-sm">
                <StarIcon className="size-3.5 fill-current" />
                {salon.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </Link>
      <div className="border-t border-border/60 p-5">
        <p className="text-sm text-foreground/60">
          From <span className="font-heading font-semibold text-foreground">₹{salon.priceFrom}</span>
          {" · "}
          {salon.reviews.toLocaleString()} reviews
        </p>
        <Button asChild className="mt-4 w-full rounded-full">
          <Link href={`/salons/${salon.id}`}>View details</Link>
        </Button>
      </div>
    </article>
  )
}
