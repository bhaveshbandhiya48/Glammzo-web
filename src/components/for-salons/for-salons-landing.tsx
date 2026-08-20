import Image from "next/image"
import Link from "next/link"
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CalendarCheckIcon,
  CheckIcon,
  CreditCardIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  MonitorSmartphoneIcon,
  PackageIcon,
  SearchIcon,
  SignpostIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react"

import { forSalonsCopy } from "@/data/for-salons-copy"
import { media } from "@/data/media"
import { ForSalonsFaqAccordion } from "@/components/for-salons/for-salons-faq-accordion"
import { Container } from "@/components/layout/container"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"
import { Button } from "@/components/ui/button"

const START_TRIAL_HREF = "/for-salons/start?plan=pro"

const trustIcons = [UsersIcon, CalendarCheckIcon, StoreIcon, MonitorSmartphoneIcon]

const offerIcons = {
  marketplace: SearchIcon,
  booking: CalendarCheckIcon,
  crm: LayoutDashboardIcon,
  nocard: CreditCardIcon,
} as const

const kitIcons = [SignpostIcon, BadgeCheckIcon, GlobeIcon, PackageIcon] as const

export function ForSalonsLanding() {
  const { hero, offer, kit, trust, howItWorks, faq, closing } = forSalonsCopy

  return (
    <>
      <Navbar />
      <main className="page-main">
        <MotionSection
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative overflow-hidden"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,color-mix(in_oklab,var(--glam-coral)_20%,transparent),transparent_48%),radial-gradient(circle_at_88%_30%,color-mix(in_oklab,var(--glam-sand)_65%,transparent),transparent_55%)]"
            aria-hidden
          />
          <Container className="relative section-y">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
              <MotionDiv variants={fadeUp} className="max-w-xl">
                <p className="section-eyebrow">{hero.eyebrow}</p>
                <h1 className="display-hero mt-4">{hero.title}</h1>
                <p className="mt-5 text-base leading-relaxed text-foreground/65 sm:text-lg">
                  {hero.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="px-8 shadow-md shadow-primary/20">
                    <Link href={START_TRIAL_HREF}>
                      {hero.primaryCta}
                      <ArrowRightIcon className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="px-8">
                    <Link href="#how-it-works">{hero.secondaryCta}</Link>
                  </Button>
                </div>
                <ul className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
                  {hero.trust.map((item) => (
                    <li
                      key={item}
                      className="inline-flex items-center gap-2 text-sm text-foreground/55"
                    >
                      <CheckIcon className="size-3.5 shrink-0 text-primary" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </MotionDiv>

              <MotionDiv variants={fadeUp} className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
                  <Image
                    src={media.sections.partnerFlangeHero}
                    alt="Glammzo certified partner flange sign on a salon storefront"
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 46vw"
                  />
                </div>
                <p className="mt-3 text-center text-xs text-foreground/45 sm:text-left">
                  Certified partner flange sign, shipped after you publish
                </p>
              </MotionDiv>
            </div>
          </Container>
        </MotionSection>

        <MotionSection
          id="offer"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="section-y bg-muted/25"
        >
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <MotionDiv variants={fadeUp} className="mx-auto max-w-3xl">
                <p className="section-eyebrow">{offer.eyebrow}</p>
                <h2 className="display-section mt-3">{offer.title}</h2>
                <p className="mt-3 text-base text-foreground/65">{offer.subtitle}</p>
              </MotionDiv>
              <div className="mt-10 grid gap-8 text-left sm:grid-cols-2 lg:grid-cols-4">
                {offer.points.map((point) => {
                  const Icon = offerIcons[point.icon]
                  return (
                    <MotionDiv key={point.title} variants={fadeUp}>
                      <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <h3 className="mt-4 font-heading text-base font-semibold tracking-tight">
                        {point.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                        {point.description}
                      </p>
                    </MotionDiv>
                  )
                })}
              </div>
              <MotionDiv variants={fadeUp}>
                <p className="mt-8 text-sm font-medium text-foreground/70">{offer.urgency}</p>
                <div className="mt-6">
                  <Button asChild size="lg" className="px-8">
                    <Link href={START_TRIAL_HREF}>
                      {hero.primaryCta}
                      <ArrowRightIcon className="size-4" />
                    </Link>
                  </Button>
                </div>
              </MotionDiv>
            </div>
          </Container>
        </MotionSection>

        <MotionSection
          id="partner-kit"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="section-y"
        >
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <MotionDiv variants={fadeUp} className="relative order-2 lg:order-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] ring-1 ring-black/8">
                  <Image
                    src={media.sections.partnerFlangeSign}
                    alt="Glammzo Book Online flange sign outside a salon"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 48vw"
                  />
                </div>
              </MotionDiv>

              <MotionDiv variants={fadeUp} className="order-1 max-w-xl lg:order-2">
                <p className="section-eyebrow">{kit.eyebrow}</p>
                <h2 className="display-section mt-3">{kit.title}</h2>
                <p className="mt-3 text-base text-foreground/65">{kit.subtitle}</p>
                <ul className="mt-7 space-y-3">
                  {kit.points.map((point, index) => {
                    const Icon = kitIcons[index] ?? CheckIcon
                    return (
                      <li key={point} className="flex items-start gap-3 text-sm text-foreground/70">
                        <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                        {point}
                      </li>
                    )
                  })}
                </ul>
                <p className="mt-6 text-sm font-medium text-foreground/55">{kit.note}</p>
              </MotionDiv>
            </div>
          </Container>
        </MotionSection>

        <MotionSection
          id="why-join"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="section-y bg-muted/20"
        >
          <Container>
            <MotionDiv variants={fadeUp} className="max-w-2xl">
              <p className="section-eyebrow">{trust.eyebrow}</p>
              <h2 className="display-section mt-3">{trust.title}</h2>
            </MotionDiv>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {trust.items.map((item, index) => {
                const Icon = trustIcons[index] ?? CheckIcon
                return (
                  <MotionDiv key={item.title} variants={fadeUp}>
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                      {item.description}
                    </p>
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
          className="section-y"
        >
          <Container>
            <MotionDiv variants={fadeUp} className="mx-auto max-w-2xl text-center">
              <p className="section-eyebrow">{howItWorks.eyebrow}</p>
              <h2 className="display-section mt-3">{howItWorks.title}</h2>
            </MotionDiv>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {howItWorks.steps.map((step, index) => (
                <MotionDiv key={step.title} variants={fadeUp} className="text-center md:text-left">
                  <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background md:mx-0">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">{step.description}</p>
                </MotionDiv>
              ))}
            </ol>
          </Container>
        </MotionSection>

        <MotionSection
          id="faq"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="section-y bg-muted/15"
        >
          <Container>
            <MotionDiv variants={fadeUp}>
              <p className="section-eyebrow">{faq.eyebrow}</p>
              <h2 className="display-section mt-3">{faq.title}</h2>
            </MotionDiv>
          </Container>
          <MotionDiv variants={fadeUp} className="mt-10">
            <ForSalonsFaqAccordion items={faq.items} />
          </MotionDiv>
        </MotionSection>

        <MotionSection
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="section-y"
        >
          <Container>
            <MotionDiv
              variants={fadeUp}
              className="overflow-hidden rounded-[1.5rem] bg-foreground text-background shadow-[0_28px_70px_-32px_rgba(0,0,0,0.45)] ring-1 ring-black/10"
            >
              <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div className="relative min-h-[240px] sm:min-h-[300px] lg:min-h-full">
                  <Image
                    src={media.sections.partnerFlangeCta}
                    alt="Glammzo certified partner flange sign outside a wellness salon"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 52vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-black/55" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:hidden">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
                      {closing.eyebrow}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-white">
                      Early cities are opening now
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
                  <p className="hidden text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase lg:block">
                    {closing.eyebrow}
                  </p>
                  <h2 className="mt-0 font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl lg:mt-3">
                    {closing.title}
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
                    {closing.subtitle}
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {closing.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-sm font-medium text-white/85"
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <CheckIcon className="size-3" strokeWidth={2.5} aria-hidden />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      asChild
                      size="lg"
                      className="px-8 shadow-lg shadow-primary/30 transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <Link href={START_TRIAL_HREF}>
                        {closing.primaryCta}
                        <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover/button:translate-x-1" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="ghost"
                      className="border border-white/25 bg-white/5 px-8 text-white hover:bg-white/12 hover:text-white"
                    >
                      <Link href="#how-it-works">{closing.secondaryCta}</Link>
                    </Button>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-white/45">{closing.note}</p>
                </div>
              </div>
            </MotionDiv>
          </Container>
        </MotionSection>
      </main>
      <Footer />
    </>
  )
}
