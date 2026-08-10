import Link from "next/link"
import { ArrowRightIcon, MapPinIcon } from "lucide-react"

import { FaqAccordion } from "@/components/faq/faq-accordion"
import { GeoAnswerBlock } from "@/components/seo/geo-answer-block"
import { SalonCard } from "@/components/salons/salon-card"
import { Button } from "@/components/ui/button"
import type { Salon } from "@/types/salon"

type LocalSalonLandingProps = {
  eyebrow: string
  title: string
  subtitle: string
  salons: Salon[]
  exploreHref: string
  exploreLabel: string
  areaLinks?: Array<{ label: string; href: string }>
  breadcrumb?: Array<{ label: string; href?: string }>
  geoAnswer?: { heading: string; answer: string; showKeyFacts?: boolean }
  faqs?: ReadonlyArray<{ question: string; answer: string }>
  faqIdPrefix?: string
}

export function LocalSalonLanding({
  eyebrow,
  title,
  subtitle,
  salons,
  exploreHref,
  exploreLabel,
  areaLinks,
  breadcrumb,
  geoAnswer,
  faqs,
  faqIdPrefix = "local-landing-faq",
}: LocalSalonLandingProps) {
  return (
    <>
      <section className="section-y">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          {breadcrumb && breadcrumb.length > 0 ? (
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-foreground/55">
              <ol className="flex flex-wrap items-center gap-1.5">
                {breadcrumb.map((crumb, index) => (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                    {index > 0 ? <span aria-hidden>/</span> : null}
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-foreground">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-foreground/80">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-foreground/65">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="px-7">
              <Link href={exploreHref}>
                {exploreLabel}
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-7">
              <Link href="/salons-near-me">Salon near me</Link>
            </Button>
          </div>
        </div>
      </section>

      {geoAnswer ? (
        <GeoAnswerBlock
          heading={geoAnswer.heading}
          answer={geoAnswer.answer}
          showKeyFacts={geoAnswer.showKeyFacts}
        />
      ) : null}

      {areaLinks && areaLinks.length > 0 ? (
        <section className="section-y section-y-separated">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Browse by neighbourhood
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {areaLinks.map((area) => (
                <li key={area.href}>
                  <Link
                    href={area.href}
                    className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <MapPinIcon className="size-4 text-primary" aria-hidden />
                    {area.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="section-y">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {salons.length > 0
              ? `${salons.length} salon${salons.length === 1 ? "" : "s"} to book`
              : "Salons coming soon"}
          </h2>
          {salons.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {salons.map((salon, index) => (
                <SalonCard key={salon.id} salon={salon} imagePriority={index < 3} />
              ))}
            </div>
          ) : (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/65">
              We’re adding partners in this area. Explore nearby listings or check Salon near me
              for salons around you.
            </p>
          )}
        </div>
      </section>

      {faqs && faqs.length > 0 ? (
        <section className="section-y section-y-separated">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
            <FaqAccordion className="mt-8" idPrefix={faqIdPrefix} items={faqs} />
          </div>
        </section>
      ) : null}
    </>
  )
}
