"use client"

import {
  BadgeCheckIcon,
  CalendarCheckIcon,
  GiftIcon,
  ReceiptIcon,
} from "lucide-react"

import { siteCopy, whyChooseReasons } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/shared/section-header"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"

const { whyChoose } = siteCopy

const ICONS = {
  verified: BadgeCheckIcon,
  pricing: ReceiptIcon,
  booking: CalendarCheckIcon,
  rewards: GiftIcon,
} as const

export function WhyChooseSection() {
  return (
    <MotionSection
      id="why-choose"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="section-y"
    >
      <Container>
        <MotionDiv variants={fadeUp}>
          <SectionHeader
            eyebrow={whyChoose.eyebrow}
            title={whyChoose.title}
            subtitle={whyChoose.subtitle}
          />
        </MotionDiv>

        <div className="mt-10 grid gap-x-8 gap-y-10 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseReasons.map((reason, index) => {
            const Icon = ICONS[reason.id as keyof typeof ICONS]
            return (
              <MotionDiv key={reason.id} variants={fadeUp} className="relative">
                <span className="font-heading text-xs font-semibold tracking-[0.16em] text-primary/70 uppercase">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="mt-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold tracking-tight">
                  {reason.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-foreground/65">
                  {reason.description}
                </p>
              </MotionDiv>
            )
          })}
        </div>
      </Container>
    </MotionSection>
  )
}
