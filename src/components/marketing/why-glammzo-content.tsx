import Link from "next/link"
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  HeadphonesIcon,
  IndianRupeeIcon,
  LockIcon,
} from "lucide-react"

import { WHY_GLAMMZO_PAGE } from "@/data/marketing-pages-copy"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PILLAR_ICONS = {
  "verified-salons": BadgeCheckIcon,
  "transparent-pricing": IndianRupeeIcon,
  "secure-booking": LockIcon,
  "customer-support": HeadphonesIcon,
} as const

export function WhyGlammzoContent() {
  const { pillars, principles, cta } = WHY_GLAMMZO_PAGE

  return (
    <>
      <PageSection tone="base">
        <PageHeader
          eyebrow={WHY_GLAMMZO_PAGE.eyebrow}
          title={WHY_GLAMMZO_PAGE.title}
          subtitle={WHY_GLAMMZO_PAGE.subtitle}
          className="max-w-3xl"
        />

        <nav aria-label="Why Glammzo topics" className="mt-8 flex flex-wrap gap-2">
          {pillars.map((pillar) => (
            <a
              key={pillar.id}
              href={`#${pillar.id}`}
              className={cn(
                "rounded-full border border-border/80 bg-background/70 px-3.5 py-2 text-sm font-medium text-foreground/65",
                "transition-colors duration-200 hover:border-border hover:bg-muted/70 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              )}
            >
              {pillar.title}
            </a>
          ))}
        </nav>
      </PageSection>

      <PageSection tone="statement" separated>
        <div className="mx-auto max-w-3xl space-y-6">
          {pillars.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.id]
            return (
              <section
                key={pillar.id}
                id={pillar.id}
                className="scroll-mt-28 rounded-2xl border border-border/65 bg-card/80 p-5 shadow-sm shadow-black/[0.02] sm:p-6"
                aria-labelledby={`${pillar.id}-heading`}
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-foreground/70"
                    aria-hidden
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <h2
                      id={`${pillar.id}-heading`}
                      className="font-heading text-xl font-semibold tracking-tight text-foreground"
                    >
                      {pillar.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                      {pillar.summary}
                    </p>
                  </div>
                </div>

                <ul className="mt-5 space-y-2.5 border-t border-border/55 pt-5">
                  {pillar.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2.5 text-sm leading-relaxed text-foreground/70"
                    >
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70"
                        aria-hidden
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {pillar.id === "customer-support" ? (
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <Button asChild size="sm" className="rounded-full">
                      <Link href="/help">
                        Open Help Center
                        <ArrowRightIcon className="size-3.5" aria-hidden />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href="/faqs">Browse FAQs</Link>
                    </Button>
                  </div>
                ) : null}

                {pillar.id === "secure-booking" ? (
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href="/privacy">Privacy Policy</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href="/terms">Terms of Service</Link>
                    </Button>
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>
      </PageSection>

      <PageSection bordered>
        <div className="mx-auto max-w-4xl">
          <p className="section-eyebrow">How we work</p>
          <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight">
            Principles behind every booking
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {principles.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-border/65 bg-card/70 p-5 shadow-sm shadow-black/[0.02]"
              >
                <h3 className="font-heading text-base font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </PageSection>

      <PageSection tone="featured" separated>
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/80 p-6 text-center shadow-sm shadow-black/[0.03]">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              {cta.customerTitle}
            </h2>
            <Button asChild className="mt-4 rounded-full">
              <Link href={cta.customerHref}>
                {cta.customerLabel}
                <ArrowRightIcon className="size-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-6 text-center shadow-sm shadow-black/[0.03]">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              {cta.partnerTitle}
            </h2>
            <Button asChild variant="outline" className="mt-4 rounded-full">
              <Link href={cta.partnerHref}>
                {cta.partnerLabel}
                <ArrowRightIcon className="size-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </PageSection>
    </>
  )
}
