"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { FAQ_PAGE, type FaqCategory } from "@/data/faq-copy"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function FaqItemRow({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-b border-border/55 last:border-b-0">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-start justify-between gap-4 py-4 text-left",
          "focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          "[&::-webkit-details-marker]:hidden",
        )}
      >
        <span className="font-heading text-base font-semibold leading-snug text-foreground">
          {question}
        </span>
        <ChevronDownIcon
          className="mt-0.5 size-4 shrink-0 text-foreground/45 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <p className="pb-4 pr-8 text-sm leading-relaxed text-foreground/65">{answer}</p>
    </details>
  )
}

function FaqCategoryBlock({ category }: { category: FaqCategory }) {
  return (
    <section id={category.id} className="scroll-mt-28" aria-labelledby={`${category.id}-heading`}>
      <div className="mb-4 max-w-2xl">
        <h2
          id={`${category.id}-heading`}
          className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          {category.title}
        </h2>
        <p className="mt-1.5 text-sm text-foreground/55">{category.description}</p>
      </div>
      <div className="rounded-2xl border border-border/65 bg-card/80 px-4 shadow-sm shadow-black/[0.02] sm:px-5">
        {category.items.map((item) => (
          <FaqItemRow key={item.question} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  )
}

export function FaqPageContent() {
  const [activeId, setActiveId] = useState(FAQ_PAGE.categories[0]?.id ?? "")

  return (
    <>
      <PageSection tone="base">
        <PageHeader
          eyebrow="Support"
          title={FAQ_PAGE.title}
          subtitle={FAQ_PAGE.subtitle}
          className="max-w-3xl"
        />

        <nav aria-label="FAQ categories" className="mt-8 flex flex-wrap gap-2">
          {FAQ_PAGE.categories.map((category) => {
            const active = activeId === category.id
            return (
              <a
                key={category.id}
                href={`#${category.id}`}
                onClick={() => setActiveId(category.id)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/80 bg-background/70 text-foreground/65 hover:border-border hover:bg-muted/70 hover:text-foreground",
                )}
              >
                {category.title}
              </a>
            )
          })}
        </nav>
      </PageSection>

      <PageSection tone="statement" separated>
        <div className="mx-auto flex max-w-3xl flex-col gap-12">
          {FAQ_PAGE.categories.map((category) => (
            <FaqCategoryBlock key={category.id} category={category} />
          ))}

          <div className="rounded-2xl border border-border/65 bg-card px-5 py-6 text-center shadow-sm shadow-black/[0.03] sm:px-8">
            <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              {FAQ_PAGE.contactPrompt}
            </h2>
            <p className="mt-2 text-sm text-foreground/60">
              Email us and include your booking reference if you have one.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Button asChild className="rounded-full px-5">
                <a href={`mailto:${FAQ_PAGE.contactEmail}`}>{FAQ_PAGE.contactEmail}</a>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-5">
                <Link href="/cancellation-policy">Cancellation Policy</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  )
}
