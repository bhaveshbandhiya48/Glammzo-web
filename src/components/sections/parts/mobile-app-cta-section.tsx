"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, SmartphoneIcon } from "lucide-react"

import { siteCopy } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { MotionDiv, MotionSection, fadeUp } from "@/components/shared/motion"

const { mobile } = siteCopy

export function MobileAppCtaSection() {
  return (
    <MotionSection
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="section-y"
    >
      <Container>
        <MotionDiv variants={fadeUp}>
          <div className="grid overflow-hidden rounded-3xl bg-foreground text-background lg:grid-cols-2">
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-background/60">
                <SmartphoneIcon className="size-3.5" />
                {mobile.eyebrow}
              </p>
              <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                {mobile.title}
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-background/65 sm:text-[17px]">{mobile.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-primary px-8 hover:bg-primary/90">
                  <Link href="/explore">
                    {mobile.primaryCta}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-background/30 bg-transparent px-8 text-background hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Link href="mailto:hello@glammzo.com?subject=Mobile%20app%20waitlist">
                    {mobile.secondaryCta}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative min-h-[280px] lg:min-h-full">
              <Image
                src="/images/sections/mobile-app.jpg"
                alt="Salon reception, book on Glammzo"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </MotionDiv>
      </Container>
    </MotionSection>
  )
}
