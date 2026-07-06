"use client"

import { howItWorksSteps, siteCopy } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/shared/section-header"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"

const { howItWorks } = siteCopy

export function HowItWorksSection() {
  return (
    <MotionSection
      id="how"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="section-y"
    >
      <Container>
        <MotionDiv variants={fadeUp}>
          <SectionHeader
            eyebrow={howItWorks.eyebrow}
            title={howItWorks.title}
            subtitle={howItWorks.subtitle}
          />
        </MotionDiv>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {howItWorksSteps.map((step) => (
            <MotionDiv
              key={step.num}
              variants={fadeUp}
              className="glam-card-surface flex flex-col p-8 sm:p-9"
            >
              <span className="font-heading text-4xl font-semibold text-primary/80">{step.num}</span>
              <h3 className="mt-4 font-heading text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-foreground/65">{step.description}</p>
            </MotionDiv>
          ))}
        </div>
      </Container>
    </MotionSection>
  )
}
