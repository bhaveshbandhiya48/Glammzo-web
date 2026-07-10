"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { siteCopy } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { MotionDiv, MotionSection, fadeUp } from "@/components/shared/motion"

const { statement } = siteCopy

export function StatementSection() {
  return (
    <MotionSection
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="section-y-separated relative border-y border-border/50 bg-muted/20 py-16 sm:py-20"
    >
      <Container>
        <MotionDiv variants={fadeUp} className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-[clamp(1.625rem,3.5vw,2.125rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-foreground">
            {statement.title}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-foreground/50">
            {statement.subtitle}
          </p>
          <Link
            href="/explore"
            className="group mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {statement.cta}
            <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </MotionDiv>
      </Container>
    </MotionSection>
  )
}
