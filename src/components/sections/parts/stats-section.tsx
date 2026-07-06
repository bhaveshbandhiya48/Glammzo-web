"use client"

import { stats } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"

export function StatsSection() {
  return (
    <MotionSection
      aria-label="Platform highlights"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="section-y section-y-separated"
    >
      <Container>
        <p className="section-eyebrow mb-10 text-center sm:mb-12">Where we are today</p>
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {stats.map((s) => (
            <MotionDiv
              key={s.label}
              variants={fadeUp}
              className="rounded-3xl border border-border/70 bg-card/60 px-6 py-8 text-center sm:text-left"
            >
              <div className="font-heading text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
                {s.value}
              </div>
              <div className="mt-2 font-heading text-lg font-medium">{s.label}</div>
              {s.description ? (
                <div className="mt-1.5 text-[15px] text-foreground/55">{s.description}</div>
              ) : null}
            </MotionDiv>
          ))}
        </div>
      </Container>
    </MotionSection>
  )
}
