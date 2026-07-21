"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeftIcon,
  ClockIcon,
  GlobeIcon,
  MapPinIcon,
  NavigationIcon,
  PhoneIcon,
  Share2Icon,
  StarIcon,
  UsersIcon,
  HeartIcon,
} from "lucide-react"

import { FacebookIcon, InstagramIcon } from "@/components/shared/social-icons"

import { Container } from "@/components/layout/container"
import { FavoriteSalonButton } from "@/components/favorites/favorite-salon-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  formatCustomerCountLabel,
  primarySalonCategory,
  salonDirectionsUrl,
} from "@/lib/salons/salon-detail-utils"
import { SalonDistanceFromYou } from "@/components/salons/salon-distance"
import { scrollToSalonServicesSection } from "@/lib/salons/salon-detail-scroll"
import type { Salon, SalonSocialLinks } from "@/types/salon"
import { cn } from "@/lib/utils"

const actionCircleClass =
  "flex size-11 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-foreground/75 shadow-sm transition duration-200 hover:border-primary/35 hover:bg-primary/[0.06] hover:text-primary hover:shadow-md active:scale-[0.97]"

function QuickAction({
  label,
  href,
  external,
  onClick,
  children,
}: {
  label: string
  href?: string
  external?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  const content = (
    <>
      <span className={actionCircleClass}>{children}</span>
      <span className="min-h-[14px] text-center text-[11px] font-medium leading-tight text-foreground/55">
        {label}
      </span>
    </>
  )

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      {href ? (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="flex w-full flex-col items-center gap-2 no-underline outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {content}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="flex w-full flex-col items-center gap-2 border-0 bg-transparent p-0 outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {content}
        </button>
      )}
    </div>
  )
}

type SalonDetailHeroProps = {
  salon: Salon
  initialFavorited: boolean
  authenticated: boolean
}

function SocialIconLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="inline-flex size-11 items-center justify-center rounded-full border border-border/70 bg-background text-foreground/70 transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.06] hover:text-primary hover:shadow-md"
    >
      {children}
    </a>
  )
}

function socialLinksList(links?: SalonSocialLinks) {
  if (!links) return []
  const items: { key: string; href: string; label: string; icon: React.ReactNode }[] = []
  if (links.instagram) {
    items.push({
      key: "instagram",
      href: links.instagram,
      label: "Instagram",
      icon: <InstagramIcon className="size-4" />,
    })
  }
  if (links.facebook) {
    items.push({
      key: "facebook",
      href: links.facebook,
      label: "Facebook",
      icon: <FacebookIcon className="size-4" />,
    })
  }
  if (links.website) {
    items.push({
      key: "website",
      href: links.website,
      label: "Website",
      icon: <GlobeIcon className="size-4" />,
    })
  }
  return items
}

export function SalonDetailHero({
  salon,
  initialFavorited,
  authenticated,
}: SalonDetailHeroProps) {
  const category = primarySalonCategory(salon)
  const shortCopy = salon.shortDescription?.trim()
  const socials = socialLinksList(salon.socialLinks)
  const [shareLabel, setShareLabel] = useState("Share")

  const onShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      if (navigator.share) {
        await navigator.share({ title: salon.name, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareLabel("Link copied")
      window.setTimeout(() => setShareLabel("Share"), 2000)
    } catch {
      /* user cancelled */
    }
  }, [salon.name])

  return (
    <section className="relative">
      <div className="relative h-[280px] w-full overflow-hidden sm:h-[420px] lg:h-[460px]">
        <Image
          src={salon.coverImageUrl}
          alt={`${salon.name} cover`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      </div>

      <Container className="relative z-10 -mt-24 pb-4 sm:-mt-32 lg:-mt-36">
        <Link
          href="/explore"
          className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/50"
        >
          <ArrowLeftIcon className="size-4" />
          Back to explore
        </Link>

        <div className="overflow-hidden rounded-[20px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_64px_-32px_hsl(var(--foreground)/0.18)] backdrop-blur-md sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-start">
            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={salon.isOpenNow ? "default" : "secondary"}
                  className="rounded-full px-3"
                >
                  {salon.isOpenNow ? "Open now" : "Closed"}
                </Badge>
                <span className="text-sm font-medium text-foreground/55">{category}</span>
              </div>

              <h1 className="font-heading text-[2rem] font-semibold tracking-tight text-foreground sm:text-[2.5rem] sm:leading-tight">
                {salon.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-foreground/70">
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <StarIcon className="size-4 fill-primary text-primary" aria-hidden />
                  {salon.rating > 0 ? salon.rating.toFixed(1) : "New"}
                  {salon.reviews > 0 ? (
                    <span className="font-normal text-foreground/55">
                      ({salon.reviews.toLocaleString()})
                    </span>
                  ) : null}
                </span>
                <SalonDistanceFromYou salon={salon} />
              </div>

              <p className="flex items-start gap-2 text-[15px] leading-relaxed text-foreground/65">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {salon.address}
              </p>

              {shortCopy ? (
                <p className="max-w-2xl text-[15px] leading-snug text-foreground/75 line-clamp-2 sm:text-base">
                  {shortCopy}
                </p>
              ) : null}

              <ul className="flex flex-wrap gap-2 pt-1" aria-label="Quick facts">
                <li className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground/75">
                  <ClockIcon className="size-3.5 text-primary" aria-hidden />
                  {salon.hours}
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground/75">
                  <UsersIcon className="size-3.5 text-primary" aria-hidden />
                  {formatCustomerCountLabel(salon.reviews)}
                </li>
              </ul>
            </div>

            <aside className="flex flex-col rounded-2xl border border-border/60 bg-muted/25 p-6 shadow-[0_12px_40px_-24px_hsl(var(--foreground)/0.18)] lg:sticky lg:top-24">
              <p className="text-center text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                Book your visit
              </p>
              <Button
                type="button"
                size="lg"
                className="mt-3 h-12 w-full rounded-full text-[15px] font-semibold shadow-md shadow-primary/20"
                onClick={() => scrollToSalonServicesSection()}
              >
                Book appointment
              </Button>

              <div className="mt-6 flex items-start justify-between gap-1 sm:gap-2">
                <QuickAction
                  label="Call"
                  href={`tel:${salon.phone.replace(/\s/g, "")}`}
                >
                  <PhoneIcon className="size-[18px]" strokeWidth={1.75} />
                </QuickAction>
                <QuickAction
                  label="Directions"
                  href={salonDirectionsUrl(salon)}
                  external
                >
                  <NavigationIcon className="size-[18px]" strokeWidth={1.75} />
                </QuickAction>
                <QuickAction label={shareLabel} onClick={() => void onShare()}>
                  <Share2Icon className="size-[18px]" strokeWidth={1.75} />
                </QuickAction>
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  {salon.crmSalonId ? (
                    <>
                      <FavoriteSalonButton
                        salonId={salon.id}
                        crmSalonId={salon.crmSalonId}
                        initialFavorited={initialFavorited}
                        authenticated={authenticated}
                        size="icon"
                        variant="ghost"
                        className={cn(
                          actionCircleClass,
                          "p-0 hover:bg-primary/[0.06]",
                        )}
                      />
                      <span className="min-h-[14px] text-center text-[11px] font-medium leading-tight text-foreground/55">
                        Save
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className={cn(actionCircleClass, "cursor-not-allowed opacity-45")}
                        aria-hidden
                      >
                        <HeartIcon className="size-[18px]" strokeWidth={1.75} />
                      </span>
                      <span className="min-h-[14px] text-center text-[11px] font-medium text-foreground/35">
                        Save
                      </span>
                    </>
                  )}
                </div>
              </div>

              {socials.length > 0 ? (
                <div className="mt-6 border-t border-border/60 pt-5">
                  <p className="mb-3 text-center text-[11px] font-semibold tracking-[0.12em] text-foreground/45 uppercase">
                    Follow
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {socials.map((item) => (
                      <SocialIconLink key={item.key} href={item.href} label={item.label}>
                        {item.icon}
                      </SocialIconLink>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </Container>
    </section>
  )
}
