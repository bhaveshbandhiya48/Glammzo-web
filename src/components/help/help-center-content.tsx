import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CircleHelpIcon,
  SearchIcon,
  ShieldCheckIcon,
  StoreIcon,
  UserRoundIcon,
  WalletIcon,
} from "lucide-react"

import { HELP_CENTER, type HelpTopic } from "@/data/help-center-copy"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TOPIC_ICONS: Record<
  HelpTopic["icon"],
  typeof SearchIcon
> = {
  search: SearchIcon,
  calendar: CalendarDaysIcon,
  wallet: WalletIcon,
  user: UserRoundIcon,
  store: StoreIcon,
  shield: ShieldCheckIcon,
}

export function HelpCenterContent() {
  return (
    <>
      <PageSection tone="base">
        <PageHeader
          eyebrow="Support"
          title={HELP_CENTER.title}
          subtitle={HELP_CENTER.subtitle}
          className="max-w-3xl"
        />

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_CENTER.topics.map((topic) => {
            const Icon = TOPIC_ICONS[topic.icon]
            return (
              <li key={topic.id}>
                <a
                  href={topic.href}
                  className={cn(
                    "flex h-full flex-col rounded-2xl border border-border/65 bg-card/80 p-5 shadow-sm shadow-black/[0.02]",
                    "transition-[border-color,box-shadow,transform] duration-200",
                    "hover:-translate-y-0.5 hover:border-border hover:shadow-md hover:shadow-black/[0.04]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  )}
                >
                  <span
                    className="inline-flex size-10 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-foreground/70"
                    aria-hidden
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <h2 className="mt-4 font-heading text-base font-semibold tracking-tight text-foreground">
                    {topic.title}
                  </h2>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-foreground/60">
                    {topic.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    View guide
                    <ArrowRightIcon className="size-3.5" aria-hidden />
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </PageSection>

      <PageSection tone="statement" separated>
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <p className="section-eyebrow">Guides</p>
            <h2 className="display-section mt-3 text-[clamp(1.5rem,3vw,2rem)]">
              Step-by-step help
            </h2>
          </div>

          {HELP_CENTER.articles.map((article) => (
            <article
              key={article.id}
              id={article.id}
              className="scroll-mt-28 rounded-2xl border border-border/65 bg-card/80 p-5 shadow-sm shadow-black/[0.02] sm:p-6"
            >
              <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {article.title}
              </h3>
              <p className="mt-1.5 text-sm text-foreground/60">{article.summary}</p>

              <ol className="mt-5 space-y-3">
                {article.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-relaxed text-foreground/70">
                    <span
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[0.7rem] font-semibold text-background"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>

              {article.relatedHref && article.relatedLabel ? (
                <div className="mt-5">
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href={article.relatedHref}>
                      {article.relatedLabel}
                      <ArrowRightIcon className="size-3.5" aria-hidden />
                    </Link>
                  </Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection bordered>
        <div className="mx-auto max-w-3xl">
          <p className="section-eyebrow">Quick links</p>
          <h2 className="mt-3 font-heading text-xl font-semibold tracking-tight">
            Popular resources
          </h2>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {HELP_CENTER.quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm font-medium text-foreground/75",
                    "transition-colors duration-200 hover:border-border hover:bg-muted/50 hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  )}
                >
                  {link.label}
                  <ArrowRightIcon className="size-3.5 text-foreground/40" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </PageSection>

      <PageSection tone="featured" separated>
        <div className="mx-auto max-w-xl rounded-2xl border border-border/60 bg-card/80 px-6 py-8 text-center shadow-sm shadow-black/[0.03] sm:px-8">
          <div
            className="mx-auto flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-foreground/60"
            aria-hidden
          >
            <CircleHelpIcon className="size-5" strokeWidth={1.75} />
          </div>
          <h2 className="mt-4 font-heading text-xl font-semibold tracking-tight">
            Still need help?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/60">
            Email us with your booking reference, salon name, and appointment time so we can
            assist faster.
          </p>
          <p className="mt-3 text-xs text-foreground/45">{HELP_CENTER.supportHours}</p>
          <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Button asChild className="rounded-full px-5">
              <a href={`mailto:${HELP_CENTER.supportEmail}`}>{HELP_CENTER.supportEmail}</a>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/faqs">Browse FAQs</Link>
            </Button>
          </div>
        </div>
      </PageSection>
    </>
  )
}
