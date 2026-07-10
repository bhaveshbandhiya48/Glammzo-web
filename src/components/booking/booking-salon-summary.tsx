import Image from "next/image"
import Link from "next/link"
import { ArrowUpRightIcon, ClockIcon, MapPinIcon, PhoneIcon, StarIcon } from "lucide-react"

import { SalonDistance } from "@/components/salons/salon-distance"
import { Badge } from "@/components/ui/badge"
import type { Salon } from "@/types/salon"

type DetailRow = {
  icon: typeof MapPinIcon
  label: string
  value: string
}

function buildDetailRows(salon: Salon): DetailRow[] {
  const rows: DetailRow[] = []

  if (salon.address.trim()) {
    rows.push({ icon: MapPinIcon, label: "Address", value: salon.address })
  }
  if (salon.hours.trim()) {
    rows.push({ icon: ClockIcon, label: "Hours", value: salon.hours })
  }
  if (salon.phone.trim()) {
    rows.push({ icon: PhoneIcon, label: "Phone", value: salon.phone })
  }

  return rows
}

export function BookingSalonSummary({ salon }: { salon: Salon }) {
  const coverImage = salon.coverImageUrl || salon.imageUrl
  const details = buildDetailRows(salon)
  const hasRating = salon.rating > 0 && salon.reviews > 0
  const description = salon.description.trim()

  return (
    <article className="mt-8 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03]">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted sm:aspect-[5/3]">
        <Image
          src={coverImage}
          alt={salon.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 520px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 p-5">
          <Badge
            variant={salon.isOpenNow ? "default" : "secondary"}
            className="rounded-full border-white/20 bg-black/35 text-white backdrop-blur-sm"
          >
            {salon.isOpenNow ? "Open now" : "Closed"}
          </Badge>
          {salon.priceFrom > 0 ? (
            <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
              From ₹{salon.priceFrom}
            </span>
          ) : null}
          {salon.services.length > 0 ? (
            <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
              {salon.services.length} service{salon.services.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="section-eyebrow !mb-0 normal-case tracking-[0.14em]">{salon.area}</p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
              {salon.name}
            </h2>
            <SalonDistance
              salon={salon}
              className="mt-3 flex items-center gap-2 text-sm text-foreground/65 sm:text-[15px]"
            />
          </div>
          {hasRating ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 font-heading text-base font-semibold">
              <StarIcon className="size-4 fill-primary text-primary" />
              {salon.rating.toFixed(1)}
              <span className="text-sm font-normal text-foreground/60">
                ({salon.reviews.toLocaleString()})
              </span>
            </span>
          ) : (
            <span className="inline-flex shrink-0 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-sm font-medium text-foreground/60">
              New on Glammzo
            </span>
          )}
        </div>

        {description ? (
          <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-foreground/70 sm:text-[15px]">
            {description}
          </p>
        ) : null}

        {details.length > 0 ? (
          <dl className="mt-6 grid gap-4 border-t border-border/60 pt-6">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-foreground/45">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-foreground/80">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        ) : null}

        <Link
          href={`/salons/${salon.id}`}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/75 underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          View full salon profile
          <ArrowUpRightIcon className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}
