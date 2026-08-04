"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { siteCopy } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"

const { statement } = siteCopy

type StatementSectionProps = {
  salonCount?: number
  categoryCount?: number
}

function formatCount(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "—"
  }
  return value.toLocaleString("en-IN")
}

export function StatementSection({
  salonCount = 0,
  categoryCount = 0,
}: StatementSectionProps) {
  const metrics = [
    {
      value: formatCount(salonCount),
      label: "Salon partners",
      detail: "Live listings on Glammzo",
    },
    {
      value: formatCount(categoryCount),
      label: "Service categories",
      detail: "Browse and book by need",
    },
    {
      value: "<2 min",
      label: "To confirm",
      detail: "Search to booked slot",
    },
  ]

  return (
    <MotionSection
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="section-y-separated !py-16 sm:!py-20"
    >
      <Container>
        <MotionDiv variants={fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">{statement.eyebrow}</p>
          <h2 className="display-section mt-3 text-balance">{statement.title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-foreground/60 sm:text-base">
            {statement.subtitle}
          </p>
          <Button asChild size="lg" className="mt-7 px-7">
            <Link href="/explore">
              {statement.cta}
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </MotionDiv>

        <MotionDiv variants={fadeUp} className="mx-auto mt-14 max-w-3xl sm:mt-16">
          <dl className="grid gap-8 border-t border-border/70 pt-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border/60">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex flex-col items-center text-center sm:px-8"
              >
                <dt className="order-2 mt-2 text-sm font-medium text-foreground/70">
                  {metric.label}
                </dt>
                <dd className="order-1 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
                  {metric.value}
                </dd>
                <p className="order-3 mt-1 text-xs leading-relaxed text-foreground/45">
                  {metric.detail}
                </p>
              </div>
            ))}
          </dl>
        </MotionDiv>
      </Container>
    </MotionSection>
  )
}
