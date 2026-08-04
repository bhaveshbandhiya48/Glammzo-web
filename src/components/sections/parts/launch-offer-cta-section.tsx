"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRightIcon, CheckIcon, CopyIcon } from "lucide-react"

import { siteCopy } from "@/data/site-copy"
import {
  LAUNCH_PROMO_ACTIVE,
  LAUNCH_PROMO_CODE,
  LAUNCH_CASHBACK_RUPEES,
} from "@/lib/marketing/launch-promo"
import { formatInr } from "@/lib/salons/catalog-utils"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { MotionDiv, MotionSection, fadeUp } from "@/components/shared/motion"

const { launchOfferCta } = siteCopy

export function LaunchOfferCtaSection() {
  const [copied, setCopied] = useState(false)

  if (!LAUNCH_PROMO_ACTIVE) {
    return null
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(LAUNCH_PROMO_CODE)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <MotionSection
      id="launch-offer"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="section-y"
    >
      <Container>
        <MotionDiv variants={fadeUp}>
          <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-10 text-background sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div
              className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary/35 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-10 size-56 rounded-full bg-primary/20 blur-3xl"
              aria-hidden
            />

            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_auto] lg:items-end lg:gap-12">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">
                  {launchOfferCta.eyebrow}
                </p>
                <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                  {launchOfferCta.title}
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/65 sm:text-base">
                  {launchOfferCta.subtitle}
                </p>
                <p className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 font-mono text-sm tracking-wide">
                  {LAUNCH_PROMO_CODE}
                  <span className="font-sans text-white/55">· {formatInr(LAUNCH_CASHBACK_RUPEES)} cashback</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="px-7 shadow-md shadow-primary/25">
                  <Link href="/explore">
                    {launchOfferCta.primaryCta}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent px-7 text-white hover:border-white/50 hover:bg-white/10 hover:text-white"
                  onClick={copyCode}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="size-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon className="size-4" />
                      {launchOfferCta.secondaryCta}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </MotionDiv>
      </Container>
    </MotionSection>
  )
}
