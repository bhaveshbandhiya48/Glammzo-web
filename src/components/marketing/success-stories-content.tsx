import Link from "next/link"
import { ArrowRightIcon, QuoteIcon } from "lucide-react"

import { SUCCESS_STORIES_PAGE } from "@/data/marketing-pages-copy"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { Button } from "@/components/ui/button"

export function SuccessStoriesContent() {
  const { highlights, stories, takeaways, cta } = SUCCESS_STORIES_PAGE

  return (
    <>
      <PageSection tone="base">
        <PageHeader
          eyebrow={SUCCESS_STORIES_PAGE.eyebrow}
          title={SUCCESS_STORIES_PAGE.title}
          subtitle={SUCCESS_STORIES_PAGE.subtitle}
          className="max-w-3xl"
        />

        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {highlights.map((item) => (
            <li
              key={item.label}
              className="rounded-2xl border border-border/65 bg-card/80 px-4 py-4 text-center shadow-sm shadow-black/[0.02]"
            >
              <p className="font-heading text-xl font-semibold tracking-tight text-foreground">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-foreground/55 sm:text-sm">{item.label}</p>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection tone="statement" separated>
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <p className="section-eyebrow">Partner stories</p>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              Early partners, real workflows
            </h2>
            <p className="mt-2 text-sm text-foreground/60">
              Stories inspired by how salon teams use Glammzo for discovery, booking, and CRM —
              outcomes vary by market and listing maturity.
            </p>
          </div>

          {stories.map((story) => (
            <article
              key={story.id}
              id={story.id}
              className="scroll-mt-28 overflow-hidden rounded-2xl border border-border/65 bg-card shadow-sm shadow-black/[0.03]"
            >
              <div className="border-b border-border/55 px-5 py-4 sm:px-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                    {story.salon}
                  </h3>
                  <p className="text-xs font-medium tracking-[0.08em] text-foreground/45 uppercase">
                    {story.category}
                  </p>
                </div>
                <p className="mt-1 text-sm text-foreground/55">{story.city}</p>
              </div>

              <div className="px-5 py-5 sm:px-6">
                <QuoteIcon className="size-5 text-primary/50" aria-hidden />
                <blockquote className="mt-3 text-base leading-relaxed text-foreground/80">
                  “{story.quote}”
                </blockquote>
                <p className="mt-3 text-xs font-medium tracking-[0.08em] text-foreground/45 uppercase">
                  {story.owner}
                </p>

                <ul className="mt-5 space-y-2 border-t border-border/55 pt-5">
                  {story.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex gap-2.5 text-sm leading-relaxed text-foreground/65"
                    >
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70"
                        aria-hidden
                      />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection bordered>
        <div className="mx-auto max-w-4xl">
          <p className="section-eyebrow">What partners gain</p>
          <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight">
            Patterns we see again and again
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {takeaways.map((item) => (
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
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">{cta.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/60">{cta.subtitle}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href={cta.primaryHref}>
                {cta.primaryLabel}
                <ArrowRightIcon className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-6">
              <Link href={cta.secondaryHref}>{cta.secondaryLabel}</Link>
            </Button>
          </div>
        </div>
      </PageSection>
    </>
  )
}
