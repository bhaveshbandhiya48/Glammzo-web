import Link from "next/link"

import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import type { LegalSection } from "@/data/legal-copy"
import { cn } from "@/lib/utils"

type LegalDocumentProps = {
  title: string
  lastUpdated: string
  intro: string[]
  sections: LegalSection[]
  eyebrow?: string
  relatedHref: string
  relatedLabel: string
}

export function LegalDocument({
  title,
  lastUpdated,
  intro,
  sections,
  eyebrow = "Legal",
  relatedHref,
  relatedLabel,
}: LegalDocumentProps) {
  return (
    <>
      <PageSection tone="base">
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          subtitle={`Last updated ${lastUpdated}`}
          className="max-w-3xl"
        />
        <p className="mt-4 max-w-3xl text-sm text-foreground/55">
          Looking for something else?{" "}
          <Link
            href={relatedHref}
            className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {relatedLabel}
          </Link>
        </p>
      </PageSection>

      <PageSection tone="statement" separated>
        <article className="mx-auto max-w-3xl">
          <div className="space-y-4 border-b border-border/60 pb-8">
            {intro.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-sm leading-relaxed text-foreground/70 sm:text-[0.95rem]">
                {paragraph}
              </p>
            ))}
          </div>

          <nav
            aria-label="On this page"
            className="mt-8 rounded-2xl border border-border/65 bg-card/70 p-4 sm:p-5"
          >
            <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-foreground/40 uppercase">
              On this page
            </p>
            <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-foreground/65 transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 56)}
                      className="text-sm leading-relaxed text-foreground/70 sm:text-[0.95rem]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((item) => (
                      <li
                        key={item.slice(0, 56)}
                        className="flex gap-2.5 text-sm leading-relaxed text-foreground/70 sm:text-[0.95rem]"
                      >
                        <span
                          className={cn(
                            "mt-2 size-1.5 shrink-0 rounded-full bg-primary/70",
                          )}
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <p className="mt-12 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3.5 text-xs leading-relaxed text-foreground/50">
            This page is provided for transparency about how Glammzo works as a salon booking
            marketplace. For advice specific to your situation, please consult a qualified legal
            professional.
          </p>
        </article>
      </PageSection>
    </>
  )
}
