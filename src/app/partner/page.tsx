import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, BarChart3Icon, CalendarIcon, UsersIcon } from "lucide-react"

import { siteCopy } from "@/data/site-copy"
import { Navbar } from "@/components/layout/navbar"
import { PageHeader } from "@/components/layout/page-header"
import { PageSection } from "@/components/layout/page-section"
import { SectionHeader } from "@/components/shared/section-header"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/sections/parts/footer"

const { partner } = siteCopy

export const metadata: Metadata = {
  title: "Partner with Glammzo",
  description: "Grow your salon with modern booking tools and premium discovery.",
}

const benefits = [
  {
    icon: UsersIcon,
    title: "Reach new clients",
    description: "Get discovered by customers searching by service, area, and availability.",
  },
  {
    icon: CalendarIcon,
    title: "Fewer no-shows",
    description: "Confirmed appointments, reminders, and clear policies keep chairs full.",
  },
  {
    icon: BarChart3Icon,
    title: "Insights that matter",
    description: "Track bookings, peak hours, and repeat visits from one calm dashboard.",
  },
]

export default function PartnerPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <PageSection tone="base">
          <PageHeader
            eyebrow="For salons"
            title="List your space. Fill your calendar."
            subtitle="Glammzo helps independent studios and premium chains get discovered, booked, and loved, without the chaos."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-8">
              <Link href="/partner-signup">
                Apply to partner
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8">
              <Link href="/partner/dashboard">Partner login</Link>
            </Button>
          </div>
        </PageSection>

        <PageSection tone="statement" separated>
          <SectionHeader
            eyebrow="Why partner"
            title="Tools built for modern salons"
            subtitle="Everything you need to attract clients, manage bookings, and grow with confidence."
            className="mb-8 sm:mb-10"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div
                  key={b.title}
                  className="rounded-3xl border border-border/80 bg-card p-8 shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03]"
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" strokeWidth={2} />
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-semibold tracking-tight">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/65">{b.description}</p>
                </div>
              )
            })}
          </div>
        </PageSection>

        <PageSection tone="featured" separated>
          <SectionHeader
            eyebrow="Get started"
            title={partner.title}
            subtitle={partner.subtitle}
            align="center"
            className="mb-8"
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-8">
              <Link href="/partner-signup">
                Apply to partner
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8">
              <Link href="/explore">See how clients find you</Link>
            </Button>
          </div>
          <p className="mt-6 text-center text-sm text-foreground/50">
            Free to apply · No commitment until you&apos;re approved
          </p>
        </PageSection>
      </main>
      <Footer />
    </>
  )
}
