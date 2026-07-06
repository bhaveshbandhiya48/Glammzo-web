import Link from "next/link"

import { siteCopy } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { Logo } from "@/components/layout/logo"
import { SocialIconLink } from "@/components/shared/social-icons"

const footerColumns: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Product",
    links: [
      { label: "Explore salons", href: "/explore" },
      { label: "How it works", href: "/#how" },
      { label: "Services", href: "/services" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "For salons", href: "/partner" },
      { label: "Apply to join", href: "/partner-signup" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Sign up", href: "/signup" },
      { label: "My bookings", href: "/dashboard/bookings" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-foreground text-background">
      <Container className="section-y">
        <div className="flex flex-col gap-10 border-b border-background/10 pb-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Logo inverse size="xl" className="-ml-1 px-0" />
            <p className="mt-5 text-sm leading-relaxed text-background/55">{siteCopy.brand.description}</p>
            <p className="mt-2 text-sm font-medium text-background/70">{siteCopy.brand.tagline}</p>
            <div className="mt-6 flex items-center gap-2.5">
              {siteCopy.social.map((link) => (
                <SocialIconLink key={link.icon} link={link} />
              ))}
            </div>
          </div>
          <div>
            <p className="meta-label text-background/40">Contact</p>
            <a
              href="mailto:hello@glamzzo.com"
              className="mt-2 block font-heading text-xl font-semibold transition-colors hover:text-primary sm:text-2xl"
            >
              hello@glamzzo.com
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {footerColumns.map((c) => (
            <div key={c.title}>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-background/40">{c.title}</div>
              <ul className="mt-4 grid gap-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-background/65 transition-colors hover:text-background"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 overflow-hidden">
          <p className="font-heading text-[clamp(3rem,12vw,8rem)] font-semibold uppercase leading-none tracking-tighter text-background/10">
            Glamzzo
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-sm text-background/45 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Glamzzo. All Rights Reserved.</div>
          <div className="flex gap-6">
            <Link href="#" className="transition-colors hover:text-background/80">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-background/80">
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
