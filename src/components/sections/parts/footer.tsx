import Link from "next/link"
import {
  BadgeCheckIcon,
  CalendarCheckIcon,
  IndianRupeeIcon,
  LockIcon,
} from "lucide-react"

import { siteCopy } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/layout/logo"
import { SocialIconLink } from "@/components/shared/social-icons"
import { cn } from "@/lib/utils"

type FooterLink = {
  label: string
  href: string
}

type FooterColumn = {
  title: string
  links: FooterLink[]
}

const TRUST_STRIP = [
  { label: "Verified Salon Partners", icon: BadgeCheckIcon },
  { label: "Transparent Pricing", icon: IndianRupeeIcon },
  { label: "Instant Booking", icon: CalendarCheckIcon },
  { label: "Secure Experience", icon: LockIcon },
] as const

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Explore Salons", href: "/explore" },
      { label: "Services", href: "/services" },
      { label: "Browse Categories", href: "/services" },
      { label: "How It Works", href: "/#how" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "FAQs", href: "/faqs" },
      { label: "Cancellation Policy", href: "/cancellation-policy" },
      { label: "Contact Us", href: "mailto:hello@glammzo.com" },
    ],
  },
  {
    title: "For Businesses",
    links: [
      { label: "Partner with Glammzo", href: "/for-salons" },
      { label: "Free Salon CRM", href: "/for-salons/start" },
      { label: "Pricing", href: "#" },
      { label: "Success Stories", href: "/success-stories" },
    ],
  },
  {
    title: "Why Glammzo",
    links: [
      { label: "Verified Salons", href: "/why-glammzo#verified-salons" },
      { label: "Transparent Pricing", href: "/why-glammzo#transparent-pricing" },
      { label: "Secure Booking", href: "/why-glammzo#secure-booking" },
      { label: "Customer Support", href: "/why-glammzo#customer-support" },
    ],
  },
]

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/privacy#cookies" },
]

function FooterNavColumn({ title, links }: FooterColumn) {
  return (
    <nav aria-label={title}>
      <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-background/40 uppercase">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-background/65 transition-colors duration-200 hover:text-background focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-foreground text-background">
      <Container className="pt-6 pb-10 sm:pt-8 sm:pb-12">
        <ul className="mb-8 grid grid-cols-2 gap-4 sm:mb-10 sm:grid-cols-4 sm:gap-5">
          {TRUST_STRIP.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="flex flex-col items-center gap-1.5 text-center sm:gap-2"
            >
              <Icon
                className="size-6 text-primary sm:size-7"
                strokeWidth={2.25}
                aria-hidden
              />
              <span className="max-w-[9.5rem] text-xs font-medium leading-snug text-background/60 sm:text-sm">
                {label}
              </span>
            </li>
          ))}
        </ul>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)] lg:gap-16 xl:gap-20">
          <div className="max-w-sm">
            <Logo inverse size="xl" className="-ml-1 px-0" />
            <p className="mt-5 text-base font-medium leading-snug text-background/85">
              Book trusted salons with confidence.
            </p>
            <p className="mt-2.5 text-sm leading-relaxed text-background/55">
              Compare prices, discover professionals, and book appointments
              effortlessly. Made for modern salon booking.
            </p>

            <div className="mt-7 flex items-center gap-3">
              {siteCopy.social.map((link) => (
                <SocialIconLink
                  key={link.icon}
                  link={link}
                  className={cn(
                    "size-11 transition-transform duration-200",
                    "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/12",
                  )}
                />
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-background/10 bg-background/[0.04] px-4 py-4">
              <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-background/40 uppercase">
                Need Help?
              </p>
              <a
                href="mailto:hello@glammzo.com"
                className="mt-2 block font-heading text-lg font-semibold tracking-tight text-background transition-colors duration-200 hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                hello@glammzo.com
              </a>
              <p className="mt-2 text-sm text-background/50">
                Mon – Sat
                <span className="mx-1.5 text-background/25" aria-hidden>
                  ·
                </span>
                9:00 AM – 7:00 PM
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 sm:gap-x-6 lg:gap-x-8">
            {FOOTER_COLUMNS.map((column) => (
              <FooterNavColumn key={column.title} {...column} />
            ))}
          </div>
        </div>

        <div className="relative mt-16 overflow-hidden sm:mt-20" aria-hidden>
          <p className="select-none font-heading text-[clamp(2.75rem,11vw,7.5rem)] font-semibold uppercase leading-none tracking-tighter text-background/[0.06]">
            Glammzo
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-background/10 pt-6 text-sm text-background/45 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p>© {new Date().getFullYear()} Glammzo. All Rights Reserved.</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors duration-200 hover:text-background/80 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {link.label}
              </Link>
            ))}
            <span className="text-background/55">Made in India 🇮🇳</span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
