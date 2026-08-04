"use client"

import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRightIcon, CheckIcon } from "lucide-react"

import { media } from "@/data/media"
import { Button } from "@/components/ui/button"
import { MotionSection, fadeUp } from "@/components/shared/motion"
import { cn } from "@/lib/utils"

type PartnerDiscoverCtaProps = {
  subtitle: ReactNode
  salonCount?: number
  className?: string
}

const TRUST_POINTS = [
  "Free CRM to start",
  "Go live in minutes",
  "No credit card needed",
] as const

export function PartnerDiscoverCta({
  subtitle,
  salonCount = 0,
  className,
}: PartnerDiscoverCtaProps) {
  const partnerProof =
    salonCount > 0
      ? `${salonCount.toLocaleString("en-IN")} salon${salonCount === 1 ? "" : "s"} already live on Glammzo`
      : "Early partner spots open across India"

  return (
    <MotionSection
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03]",
        className,
      )}
    >
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[240px] overflow-hidden sm:min-h-[300px] lg:min-h-[420px]">
          <Image
            src={media.sections.partnerSalon}
            alt="Professional luxury salon interior"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="max-w-sm rounded-xl border border-white/25 bg-white/95 p-3.5 shadow-md backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                Now onboarding
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
                {partnerProof}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <p className="section-eyebrow">Own a salon?</p>
          <h2 className="display-section mt-3 max-w-md text-balance">
            Get discovered on Glammzo
          </h2>
          <div className="mt-3 max-w-md text-[15px] leading-relaxed text-foreground/65 sm:text-base">
            {subtitle}
          </div>

          <ul className="mt-6 flex flex-col gap-2.5 sm:mt-7">
            {TRUST_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2.5 text-sm font-medium text-foreground/80"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <CheckIcon className="size-3" strokeWidth={2.5} aria-hidden />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="px-7 shadow-md shadow-primary/20">
              <Link href="/for-salons/start">
                Partner with us
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-7">
              <Link href="/for-salons">See how it works</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-foreground/45">
            Setup takes minutes. Publish when you&apos;re ready to get bookings.
          </p>
        </div>
      </div>
    </MotionSection>
  )
}
