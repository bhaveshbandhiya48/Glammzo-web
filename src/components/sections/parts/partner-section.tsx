"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  Building2Icon,
  CalendarCheckIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"

import { siteCopy } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { MotionDiv, MotionSection, fadeUp } from "@/components/shared/motion"
import { cn } from "@/lib/utils"

const { partner } = siteCopy

const benefits = [
  {
    icon: UsersIcon,
    title: "Reach new clients",
    description: "Get discovered by people searching in your area.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Fewer no-shows",
    description: "Reminders and clear confirmations keep chairs full.",
  },
  {
    icon: Building2Icon,
    title: "One calm dashboard",
    description: "Bookings, schedule, and insights in one place.",
  },
]

export function PartnerSection() {
  return (
    <MotionSection
      id="partner"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="section-y"
    >
      <Container>
        <MotionDiv variants={fadeUp}>
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_20px_50px_-28px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.03]">
            <div
              className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--glam-coral)_18%,transparent),transparent_70%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-16 bottom-0 size-56 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--glam-sand)_55%,transparent),transparent_65%)]"
              aria-hidden
            />

            <div className="relative grid lg:grid-cols-[1fr_17.5rem] xl:grid-cols-[1fr_19rem]">
              {/* Content */}
              <div className="p-8 sm:p-10 lg:p-12 lg:pr-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70">
                  <SparklesIcon className="size-3.5 text-primary" aria-hidden />
                  {partner.eyebrow}
                </div>

                <h2 className="display-section mt-5 max-w-lg">{partner.title}</h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/65">
                  {partner.subtitle}
                </p>

                <ul className="mt-10 grid gap-3 sm:grid-cols-3 sm:gap-4">
                  {benefits.map(({ icon: Icon, title, description }) => (
                    <li
                      key={title}
                      className={cn(
                        "rounded-2xl border border-border/60 bg-background/70 p-4",
                        "transition-colors hover:border-border hover:bg-background"
                      )}
                    >
                      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-4" strokeWidth={2} aria-hidden />
                      </span>
                      <p className="mt-3 text-sm font-semibold leading-snug text-foreground">{title}</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-foreground/55">{description}</p>
                    </li>
                  ))}
                </ul>

                {/* Mobile / tablet CTAs */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:hidden">
                  <Button asChild size="lg" className="h-12 flex-1 rounded-full shadow-md shadow-primary/20">
                    <Link href="/partner-signup">
                      Apply to partner
                      <ArrowRightIcon className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 flex-1 rounded-full border-border/80 bg-background/80"
                  >
                    <Link href="/partner">How partnering works</Link>
                  </Button>
                </div>
              </div>

              {/* Desktop CTA rail — centered stack (avoids large empty gap from justify-between) */}
              <aside className="hidden flex-col justify-center gap-6 border-t border-border/60 bg-muted/25 p-8 lg:flex lg:border-l lg:border-t-0 lg:p-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/45">
                    Get started
                  </p>
                  <p className="mt-2 font-heading text-lg font-semibold leading-snug text-foreground">
                    Join salons already on Glammzo.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button asChild size="lg" className="h-12 w-full rounded-full shadow-md shadow-primary/20">
                    <Link href="/partner-signup">
                      Apply to partner
                      <ArrowRightIcon className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="h-11 w-full rounded-full text-foreground/75 hover:bg-background/80 hover:text-foreground"
                  >
                    <Link href="/partner">How partnering works</Link>
                  </Button>
                </div>

                <p className="text-center text-[11px] leading-relaxed text-foreground/45">
                  Free to apply · No commitment until you&apos;re approved
                </p>
              </aside>
            </div>
          </div>
        </MotionDiv>
      </Container>
    </MotionSection>
  )
}
