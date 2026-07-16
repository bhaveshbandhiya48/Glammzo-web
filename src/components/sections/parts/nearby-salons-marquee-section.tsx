"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { useMemo } from "react"

import { SalonMarqueeBand } from "@/components/sections/parts/salon-marquee-band"
import { Container } from "@/components/layout/container"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"
import { useCitySalonCatalog } from "@/hooks/use-city-salon-catalog"
import { useExploreDistanceOrigin } from "@/hooks/use-explore-distance-origin"
import { siteCopy } from "@/data/site-copy"
import { pickNearbySalons } from "@/lib/salons/nearby-salons"

const { nearbySalonsMarquee } = siteCopy

function NearbySalonsMarqueeSkeleton() {
  return (
    <div className="py-0">
      <div className="flex gap-5 overflow-hidden px-4 sm:gap-6 sm:px-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="w-[min(88vw,300px)] shrink-0 animate-pulse overflow-hidden rounded-xl border border-border/60 bg-card sm:w-[300px] lg:w-[320px]"
          >
            <div className="aspect-[4/3] bg-muted/40" />
            <div className="space-y-3 border-t border-border/60 p-5">
              <div className="h-4 w-2/3 rounded-md bg-muted/50" />
              <div className="h-10 w-full rounded-full bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function NearbySalonsMarqueeSection() {
  const { salons, loaded, browseCity } = useCitySalonCatalog()
  const origin = useExploreDistanceOrigin({})

  const nearbySalons = useMemo(
    () =>
      pickNearbySalons(salons, {
        latitude: origin.latitude,
        longitude: origin.longitude,
      }),
    [salons, origin.latitude, origin.longitude],
  )
  const exploreHref = browseCity
    ? `/explore?city=${encodeURIComponent(browseCity)}`
    : "/explore"

  return (
    <MotionSection
      id="nearby-salons"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="section-y-t overflow-x-clip pb-0"
    >
      <Container>
        <MotionDiv
          variants={fadeUp}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <p className="section-eyebrow mb-3">{nearbySalonsMarquee.eyebrow}</p>
            <h2 className="display-section">{nearbySalonsMarquee.title}</h2>
            <p className="mt-4 text-[15px] leading-7 text-foreground/65 sm:text-[17px]">
              {nearbySalonsMarquee.subtitle}
            </p>
          </div>
          <Link
            href={exploreHref}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {nearbySalonsMarquee.viewAllCta}
            <ArrowRightIcon className="size-4" />
          </Link>
        </MotionDiv>
      </Container>

      <MotionDiv variants={fadeUp} className="mt-8 sm:mt-9">
        {loaded ? <SalonMarqueeBand salons={nearbySalons} /> : <NearbySalonsMarqueeSkeleton />}
      </MotionDiv>
    </MotionSection>
  )
}
