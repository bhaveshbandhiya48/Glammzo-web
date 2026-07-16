"use client"

import Link from "next/link"
import { ArrowRightIcon, ClockIcon, ScissorsIcon, StoreIcon } from "lucide-react"

import { stats, siteCopy } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"
import { cn } from "@/lib/utils"

const { statement, stats: statsCopy } = siteCopy

const statIcons = [StoreIcon, ScissorsIcon, ClockIcon] as const

export function StatementSection() {
  return (
    <MotionSection
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="section-y-separated section-band-statement !py-14 sm:!py-16"
    >
      <Container>
        <MotionDiv variants={fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">{statement.eyebrow}</p>
          <h2 className="display-section mt-3 text-balance">{statement.title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-foreground/60 sm:text-base">
            {statement.subtitle}
          </p>
          <Button asChild size="lg" className="mt-6 px-7 shadow-md shadow-primary/15">
            <Link href="/explore">
              {statement.cta}
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </MotionDiv>

        <MotionDiv variants={fadeUp} className="mx-auto mt-10 max-w-4xl sm:mt-12">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-foreground/45">
            {statsCopy.eyebrow}
          </p>
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03] backdrop-blur-sm">
            <div className="grid sm:grid-cols-3 sm:divide-x sm:divide-border/60">
              {stats.map((stat, index) => {
                const Icon = statIcons[index] ?? StoreIcon
                return (
                  <div
                    key={stat.label}
                    className={cn(
                      "flex flex-col items-center px-5 py-6 text-center sm:items-start sm:px-6 sm:py-7 sm:text-left",
                      index > 0 && "border-t border-border/60 sm:border-t-0",
                    )}
                  >
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden />
                    </div>
                    <p className="mt-4 font-heading text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 font-heading text-base font-semibold text-foreground">
                      {stat.label}
                    </p>
                    {stat.description ? (
                      <p className="mt-1 text-sm leading-relaxed text-foreground/55">
                        {stat.description}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </MotionDiv>
      </Container>
    </MotionSection>
  )
}
