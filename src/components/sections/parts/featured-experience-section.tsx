"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, CheckIcon } from "lucide-react"

import { siteCopy } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/shared/section-header"
import { Button } from "@/components/ui/button"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"

const { experience } = siteCopy

const highlights = [
  "Upfront pricing on every service",
  "Real reviews from verified visits",
  "Instant booking confirmation",
]

export function FeaturedExperienceSection() {
  return (
    <MotionSection
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="section-y section-y-separated section-band-featured"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <MotionDiv variants={fadeUp}>
            <SectionHeader
              eyebrow={experience.eyebrow}
              title={experience.title}
              subtitle={experience.subtitle}
            />
            <ul className="mt-8 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-foreground/70">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <CheckIcon className="size-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-8">
                <Link href="/explore">
                  Start exploring
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-8">
                <Link href="/partner-signup">Partner with us</Link>
              </Button>
            </div>
          </MotionDiv>

          <MotionDiv variants={fadeUp} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-black/[0.08]">
              <Image
                src="/images/sections/featured-experience.jpg"
                alt="Hair styling at a partner salon"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-white/90 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground/45">
                  {experience.previewLabel}
                </p>
                <p className="mt-1 font-heading text-base font-semibold">{experience.previewTitle}</p>
                <p className="mt-0.5 text-sm text-foreground/55">{experience.previewDetail}</p>
              </div>
            </div>
          </MotionDiv>
        </div>
      </Container>
    </MotionSection>
  )
}
