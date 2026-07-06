"use client"

import Link from "next/link"
import { ArrowRightIcon, SparklesIcon } from "lucide-react"

import { siteCopy } from "@/data/site-copy"
import { media } from "@/data/media"
import { HeroVisual } from "@/components/sections/parts/hero-visual"
import { Container } from "@/components/layout/container"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { HeroSearchForm } from "@/components/search/hero-search-form"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"

const { hero } = siteCopy

const earlyUsers = [
  { src: media.testimonials.t1, alt: "Glamzzo user" },
  { src: media.testimonials.t2, alt: "Glamzzo user" },
  { src: media.testimonials.t3, alt: "Glamzzo user" },
]

export function HeroSection() {
  return (
    <MotionSection
      id="home"
      initial={false}
      animate="show"
      variants={stagger}
      className="section-y-hero relative overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 glam-glow" />
      <div className="pointer-events-none absolute -right-32 top-16 -z-10 size-[480px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--glam-coral)_12%,transparent)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-24 bottom-0 -z-10 size-[360px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--glam-sand)_80%,transparent)_0%,transparent_65%)]" />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-12 xl:gap-20">
          <MotionDiv variants={fadeUp} className="max-w-xl lg:max-w-none">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-sm text-foreground/80 shadow-sm backdrop-blur-sm">
              <SparklesIcon className="size-3.5 text-primary" />
              <span className="font-medium text-foreground">{hero.badge}</span>
            </div>

            <h1 className="hero-headline mt-7">
              {hero.headline}{" "}
              <span className="text-primary">{hero.headlineAccent}</span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-foreground/65">{hero.subhead}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-7 text-base shadow-md shadow-primary/20">
                <Link href="/explore">
                  {hero.primaryCta}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-border/80 bg-card/60 px-7 text-base"
              >
                <Link href="/#how">{hero.secondaryCta}</Link>
              </Button>
            </div>

            <HeroSearchForm />

            <div className="relative z-0 mt-10 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {earlyUsers.map((user, i) => (
                  <Avatar
                    key={`${user.src}-${i}`}
                    className="relative size-10 border-2 border-background ring-0"
                    style={{ zIndex: i + 1 }}
                  >
                    <AvatarImage src={user.src} alt={user.alt} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <p className="text-sm text-foreground/60">{hero.socialProof}</p>
            </div>
          </MotionDiv>

          <MotionDiv variants={fadeUp}>
            <HeroVisual />
          </MotionDiv>
        </div>
      </Container>
    </MotionSection>
  )
}
