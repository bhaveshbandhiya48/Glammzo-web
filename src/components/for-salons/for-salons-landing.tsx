import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  CheckIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"

import { forSalonsCopy } from "@/data/for-salons-copy"
import { Container } from "@/components/layout/container"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"
import { Button } from "@/components/ui/button"

const benefitIcons = [
  CalendarCheckIcon,
  UsersIcon,
  LayoutDashboardIcon,
  ClipboardListIcon,
  SparklesIcon,
  MapPinIcon,
]

export function ForSalonsLanding() {
  const { hero, benefits, howItWorks, faq } = forSalonsCopy

  return (
    <>
      <Navbar />
      <main className="page-main">
        <MotionSection
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative overflow-hidden border-b border-border/60"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in_oklab,var(--glam-coral)_22%,transparent),transparent_50%),radial-gradient(circle_at_85%_40%,color-mix(in_oklab,var(--glam-sand)_70%,transparent),transparent_55%)]"
            aria-hidden
          />
          <Container className="relative section-y">
            <MotionDiv variants={fadeUp} className="max-w-3xl">
              <p className="section-eyebrow">{hero.eyebrow}</p>
              <h1 className="display-hero mt-4">{hero.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/65 sm:text-lg">
                {hero.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="px-8 shadow-md shadow-primary/20">
                  <Link href="/for-salons/start">
                    {hero.primaryCta}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8">
                  <Link href="#how-it-works">{hero.secondaryCta}</Link>
                </Button>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-foreground/50 sm:text-sm">
                {hero.trust.join(" · ")}
              </p>
            </MotionDiv>
          </Container>
        </MotionSection>

        <MotionSection
          id="benefits"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="section-y"
        >
          <Container>
            <MotionDiv variants={fadeUp} className="max-w-2xl">
              <p className="section-eyebrow">{benefits.eyebrow}</p>
              <h2 className="display-section mt-3">{benefits.title}</h2>
              <p className="mt-3 text-base text-foreground/65">{benefits.subtitle}</p>
            </MotionDiv>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.items.map((item, index) => {
                const Icon = benefitIcons[index] ?? CheckIcon
                return (
                  <MotionDiv
                    key={item.title}
                    variants={fadeUp}
                    className="rounded-3xl border border-border/70 bg-card/80 p-6 ring-1 ring-black/[0.02]"
                  >
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">
                      ✓ {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/60">{item.description}</p>
                  </MotionDiv>
                )
              })}
            </div>
          </Container>
        </MotionSection>

        <MotionSection
          id="how-it-works"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="section-y border-y border-border/60 bg-muted/20"
        >
          <Container>
            <MotionDiv variants={fadeUp} className="mx-auto max-w-2xl text-center">
              <p className="section-eyebrow">{howItWorks.eyebrow}</p>
              <h2 className="display-section mt-3">{howItWorks.title}</h2>
            </MotionDiv>
            <ol className="mt-12 grid gap-6 md:grid-cols-4">
              {howItWorks.steps.map((step, index) => (
                <MotionDiv key={step.title} variants={fadeUp} className="relative text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">{step.description}</p>
                </MotionDiv>
              ))}
            </ol>
            <div className="mt-12 flex justify-center">
              <Button asChild size="lg" className="px-8">
                <Link href="/for-salons/start">
                  Start Free
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
          </Container>
        </MotionSection>

        <MotionSection
          id="faq"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="section-y"
        >
          <Container>
            <MotionDiv variants={fadeUp} className="max-w-2xl">
              <p className="section-eyebrow">{faq.eyebrow}</p>
              <h2 className="display-section mt-3">{faq.title}</h2>
            </MotionDiv>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {faq.items.map((item) => (
                <MotionDiv
                  key={item.q}
                  variants={fadeUp}
                  className="rounded-3xl border border-border/70 bg-background p-6"
                >
                  <h3 className="font-heading text-base font-semibold">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/65">{item.a}</p>
                </MotionDiv>
              ))}
            </div>
          </Container>
        </MotionSection>
      </main>
      <Footer />
    </>
  )
}
