"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, MapPinIcon, StarIcon } from "lucide-react"
import { useMemo } from "react"

import { useExploreDistanceOrigin } from "@/hooks/use-explore-distance-origin"
import { useSalonCatalog } from "@/hooks/use-salon-catalog"
import { applySalonDistances } from "@/lib/explore-distance"
import { siteCopy } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/shared/section-header"
import { Button } from "@/components/ui/button"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"
import type { Salon } from "@/types/salon"

import { cn } from "@/lib/utils"

const { salons: salonsCopy } = siteCopy

function toNearbyPreview(salon: Salon) {
  return {
    id: salon.id,
    name: salon.name,
    area: salon.area,
    imageUrl: salon.imageUrl,
    rating: salon.rating,
    reviews: salon.reviews,
    distanceKm: salon.distanceKm,
    isOpenNow: salon.isOpenNow,
    priceFrom: salon.priceFrom,
  }
}

export function NearbySalonsSection() {
  const { salons: catalog } = useSalonCatalog()
  const origin = useExploreDistanceOrigin({})
  const nearbySalons = useMemo(
    () => applySalonDistances(catalog, origin).slice(0, 4).map(toNearbyPreview),
    [catalog, origin],
  )
  return (
    <MotionSection
      id="nearby"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="section-y section-y-separated section-band-dark"
    >
      <Container>
        <MotionDiv variants={fadeUp}>
          <SectionHeader
            theme="dark"
            eyebrow={salonsCopy.eyebrow}
            title={salonsCopy.title}
            subtitle={salonsCopy.subtitle}
            action={
              <Link
                href="/partner-signup"
                className="inline-flex items-center gap-2 text-sm font-medium text-background/70 transition-colors hover:text-primary"
              >
                {salonsCopy.partnerCta}
                <ArrowRightIcon className="size-4" />
              </Link>
            }
          />
        </MotionDiv>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {nearbySalons.map((s, i) => (
            <MotionDiv key={s.id} variants={fadeUp} className={cn(i === 0 && "sm:col-span-2")}>
              <Link href={`/salons/${s.id}`} className="group relative block overflow-hidden rounded-3xl">
                <article>
                  <div className={cn("relative w-full overflow-hidden", i === 0 ? "aspect-[21/9]" : "aspect-[4/3]")}>
                    <Image
                      src={s.imageUrl}
                      alt={`${s.name} salon`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes={i === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
                        <MapPinIcon className="size-4 shrink-0" />
                        <span>{s.area}</span>
                        {s.distanceKm > 0 ? (
                          <>
                            <span>·</span>
                            <span>{s.distanceKm.toFixed(1)} km</span>
                          </>
                        ) : null}
                        {s.isOpenNow ? (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                            Open now
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 font-heading text-2xl font-semibold text-white sm:text-3xl">{s.name}</h3>
                      <p className="mt-1 text-sm text-white/60">
                        From ₹{s.priceFrom} · {s.reviews.toLocaleString()} reviews
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur">
                        <StarIcon className="size-3.5 fill-current" />
                        {s.rating.toFixed(1)}
                      </span>
                      <span className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        View salon
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </MotionDiv>
          ))}
        </div>

        <MotionDiv variants={fadeUp} className="mt-12 flex justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/explore">
              See all salons
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </MotionDiv>
      </Container>
    </MotionSection>
  )
}
