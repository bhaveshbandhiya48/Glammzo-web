"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { siteCopy } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { MotionDiv, MotionSection, fadeUp } from "@/components/shared/motion"

const { statement } = siteCopy

export function StatementSection() {
  return (
    <MotionSection
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="section-y section-y-separated relative section-band-statement"
    >
      <Container>
        <MotionDiv variants={fadeUp} className="mx-auto max-w-3xl text-center">
          <p className="section-eyebrow mb-6">{statement.eyebrow}</p>
          <p className="editorial-statement text-balance">{statement.body}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-8">
              <Link href="/explore">
                {statement.primaryCta}
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-border/80 px-8">
              <Link href="/services">{statement.secondaryCta}</Link>
            </Button>
          </div>
        </MotionDiv>
      </Container>
    </MotionSection>
  )
}
