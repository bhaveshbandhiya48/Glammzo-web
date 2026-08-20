"use client"

import Link from "next/link"
import { ArrowRightIcon, SparklesIcon } from "lucide-react"

import { FloatingGradientBlob } from "@/components/hero/FloatingGradientBlob"
import { siteCopy } from "@/data/site-copy"
import { HeroLiveBadge } from "@/components/explore/explore-location-copy"
import { HeroLaunchOfferCallout } from "@/components/sections/parts/hero-launch-offer-callout"
import { HeroVisual } from "@/components/sections/parts/hero-visual"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { HeroSearchForm } from "@/components/search/hero-search-form"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"

const { hero } = siteCopy

export function HeroSection() {
  return (
    <MotionSection
      id="home"
      initial={false}
      animate="show"
      variants={stagger}
      className="section-y-hero relative z-20 overflow-x-clip overflow-y-visible"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-x-clip" aria-hidden>
        <div className="glam-glow absolute inset-0" />
        <div className="absolute -right-32 top-16 size-[480px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--glam-coral)_12%,transparent)_0%,transparent_70%)]" />
        <div className="absolute -left-24 bottom-0 size-[360px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--glam-sand)_80%,transparent)_0%,transparent_65%)]" />
        <FloatingGradientBlob />
      </div>

      <Container>
        <div className="grid items-start gap-14 lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-20">
          <MotionDiv variants={fadeUp} className="relative z-30 max-w-xl lg:max-w-none">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-sm text-foreground/80 shadow-sm backdrop-blur-sm">
              <SparklesIcon className="size-3.5 text-primary" />
              <span className="font-medium text-foreground">
                <HeroLiveBadge />
              </span>
            </div>

            <h1 className="hero-headline mt-7">
              {hero.headline}{" "}
              <span className="text-primary">{hero.headlineAccent}</span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-foreground/65">{hero.subhead}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="px-7 shadow-md shadow-primary/20">
                <Link href="/explore">
                  {hero.primaryCta}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border/80 bg-card/60 px-7"
              >
                <Link href="/#how">{hero.secondaryCta}</Link>
              </Button>
            </div>

            <HeroSearchForm />
          </MotionDiv>

          <MotionDiv
            variants={fadeUp}
            className="mx-auto flex w-full max-w-[520px] flex-col gap-3"
          >
            <HeroVisual />
            <HeroLaunchOfferCallout />
          </MotionDiv>
        </div>
      </Container>
    </MotionSection>
  )
}
