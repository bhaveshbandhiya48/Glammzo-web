"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { CheckIcon, ClockIcon, StarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { buildBookHref } from "@/lib/bookings/utils"
import { formatInr, resolveServiceThumbnail } from "@/lib/salons/catalog-utils"
import {
  buildServiceDetailContent,
  type ServiceDetailContent,
} from "@/lib/salons/service-detail-utils"
import type { SalonReview, SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type ServiceDetailSheetProps = {
  service: SalonService | null
  allServices: SalonService[]
  salonReviews: SalonReview[]
  salonId: string
  authenticated: boolean
  selected: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggle: () => void
  onAddOnToggle: (id: string) => void
  selectedIds: string[]
}

function DetailSection({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("border-t border-border/60 pt-5 first:border-t-0 first:pt-0", className)}>
      <h3 className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function ServiceDetailInfoPanel({ content }: { content: ServiceDetailContent }) {
  const hasInfo =
    content.about ||
    content.benefits.length > 0 ||
    content.includedSteps.length > 0 ||
    content.recommendedFor.length > 0 ||
    content.thingsToKnow.length > 0 ||
    content.reviews.length > 0

  if (!hasInfo) {
    return (
      <p className="text-sm leading-relaxed text-foreground/60">
        More details for this service will appear here when the salon adds them.
      </p>
    )
  }

  return (
    <>
      {content.about ? (
        <DetailSection title="About this service">
          <p className="text-[15px] leading-relaxed text-foreground/70">{content.about}</p>
        </DetailSection>
      ) : null}

      {content.benefits.length > 0 ? (
        <DetailSection title="Benefits">
          <ul className="space-y-2.5">
            {content.benefits.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/75">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </DetailSection>
      ) : null}

      {content.includedSteps.length > 0 ? (
        <DetailSection title="What's included">
          <ol className="space-y-2">
            {content.includedSteps.map((step, index) => (
              <li
                key={`${step}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3.5 py-2.5 text-sm text-foreground/75"
              >
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </DetailSection>
      ) : null}

      {content.recommendedFor.length > 0 ? (
        <DetailSection title="Recommended for">
          <div className="flex flex-wrap gap-2">
            {content.recommendedFor.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-foreground/70"
              >
                {item}
              </span>
            ))}
          </div>
        </DetailSection>
      ) : null}

      {content.thingsToKnow.length > 0 ? (
        <DetailSection title="Before / after care">
          <dl className="space-y-3">
            {content.thingsToKnow.map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-semibold tracking-wide text-foreground/45 uppercase">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-foreground/70">{item.value}</dd>
              </div>
            ))}
          </dl>
        </DetailSection>
      ) : null}

      {content.reviews.length > 0 ? (
        <DetailSection title="Customer reviews">
          <ul className="space-y-3">
            {content.reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-xl border border-border/60 bg-background/60 p-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{review.userId}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium">
                    <StarIcon className="size-3.5 fill-primary text-primary" />
                    {review.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{review.comment}</p>
              </li>
            ))}
          </ul>
        </DetailSection>
      ) : null}
    </>
  )
}

function ServiceDetailSummaryPanel({
  service,
  content,
  thumbnail,
  bookHref,
  selected,
  selectedIds,
  onToggle,
  onAddOnToggle,
  compactImage = false,
}: {
  service: SalonService
  content: ServiceDetailContent
  thumbnail: string
  bookHref: string
  selected: boolean
  selectedIds: string[]
  onToggle: () => void
  onAddOnToggle: (id: string) => void
  compactImage?: boolean
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden bg-muted/30",
          compactImage ? "h-[160px]" : "h-[200px]",
        )}
      >
        <Image
          src={thumbnail}
          alt={service.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 360px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 py-5 sm:px-6">
        <SheetHeader className="space-y-3 p-0 text-left">
          <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
            Service summary
          </p>
          <SheetTitle className="font-heading text-xl leading-tight sm:text-2xl">
            {service.name}
          </SheetTitle>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-foreground/60">
            <span>{service.category}</span>
            {content.rating !== null ? (
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <StarIcon className="size-4 fill-primary text-primary" />
                {content.rating.toFixed(1)}
                <span className="font-normal text-foreground/50">({content.reviewCount})</span>
              </span>
            ) : null}
          </div>
        </SheetHeader>

        <div className="mt-4 rounded-xl border border-border/60 bg-background/80 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-foreground/50">Price</p>
              <p className="font-heading text-2xl font-semibold tabular-nums text-foreground">
                {formatInr(service.price)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-foreground/50">Duration</p>
              <p className="inline-flex items-center justify-end gap-1 text-sm font-medium text-foreground">
                <ClockIcon className="size-3.5 text-foreground/50" />
                {service.durationMin} min
              </p>
            </div>
          </div>

          {content.highlight ? (
            <p className="mt-3 border-t border-border/50 pt-3 text-sm leading-relaxed text-foreground/65">
              {content.highlight}
            </p>
          ) : null}
        </div>

        {content.addOns.length > 0 ? (
          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
              Add-ons
            </p>
            <ul className="space-y-2">
              {content.addOns.map((addOn) => {
                const addOnSelected = selectedIds.includes(addOn.id)
                return (
                  <li
                    key={addOn.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{addOn.name}</p>
                      <p className="mt-0.5 text-xs text-foreground/55">
                        {addOn.durationMin} min · {formatInr(addOn.price)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={addOnSelected ? "secondary" : "outline"}
                      className="shrink-0 rounded-full"
                      onClick={() => onAddOnToggle(addOn.id)}
                    >
                      {addOnSelected ? "Added" : "Add"}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        <div className="mt-auto space-y-2 border-t border-border/60 pt-5">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            onClick={onToggle}
          >
            {selected ? "Remove from booking" : "Add to booking"}
          </Button>
          <Button asChild className="w-full rounded-full" size="lg">
            <Link href={bookHref}>Book Service</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ServiceDetailSheet({
  service,
  allServices,
  salonReviews,
  salonId,
  authenticated,
  selected,
  open,
  onOpenChange,
  onToggle,
  onAddOnToggle,
  selectedIds,
}: ServiceDetailSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  if (!service) return null

  const content = buildServiceDetailContent(service, allServices, salonReviews)
  const thumbnail = resolveServiceThumbnail(service)
  const bookHref = buildBookHref(salonId, [service.id], authenticated)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={
          isDesktop
            ? "h-full w-[min(94vw,920px)] max-w-none gap-0 p-0 sm:max-w-none"
            : "max-h-[92vh] gap-0 rounded-t-3xl p-0"
        }
      >
        <div className="flex h-full min-h-0 flex-col lg:flex-row">
          <aside className="order-1 shrink-0 border-b border-border/60 bg-muted/15 lg:order-2 lg:flex lg:h-full lg:min-h-0 lg:w-[min(100%,360px)] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-l">
            <ServiceDetailSummaryPanel
              service={service}
              content={content}
              thumbnail={thumbnail}
              bookHref={bookHref}
              selected={selected}
              selectedIds={selectedIds}
              onToggle={onToggle}
              onAddOnToggle={onAddOnToggle}
              compactImage={!isDesktop}
            />
          </aside>

          <div className="order-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:order-1">
            <div className="border-b border-border/60 px-5 py-4 lg:px-6">
              <h2 className="font-heading text-base font-semibold text-foreground">
                Service information
              </h2>
              <p className="mt-1 text-sm text-foreground/55">
                What&apos;s included, care tips, and guest reviews.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5 lg:px-6 lg:py-6">
              <ServiceDetailInfoPanel content={content} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
