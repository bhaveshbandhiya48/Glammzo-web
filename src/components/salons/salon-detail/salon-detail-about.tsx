import { BadgeCheckIcon, SparklesIcon } from "lucide-react"

import { FacebookIcon, InstagramIcon } from "@/components/shared/social-icons"
import { primarySalonCategory } from "@/lib/salons/salon-detail-utils"
import type { Salon } from "@/types/salon"
import { cn } from "@/lib/utils"

export function SalonDetailAbout({ salon }: { salon: Salon }) {
  const longCopy = salon.longDescription?.trim() || salon.description
  const category = primarySalonCategory(salon)
  const specialties = [
    ...new Set(salon.services.map((service) => service.category).filter(Boolean)),
  ].slice(0, 6)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BadgeCheckIcon className="size-3.5" />
            Verified business
          </span>
          <span className="text-sm text-foreground/55">{category}</span>
        </div>

        <p className="text-[15px] leading-8 text-foreground/80 sm:text-base">{longCopy}</p>

        {specialties.length > 0 ? (
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
              Specialities
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {specialties.map((name) => (
                <li
                  key={name}
                  className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm font-medium text-foreground/75"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
            At a glance
          </p>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-foreground/50">Experience</dt>
              <dd className="mt-1 font-medium text-foreground">
                {salon.team.length > 0
                  ? `${salon.team.length} specialists on Glammzo`
                  : "Professional team"}
              </dd>
            </div>
            <div>
              <dt className="text-foreground/50">Services</dt>
              <dd className="mt-1 font-medium text-foreground">
                {salon.services.length} bookable treatments
              </dd>
            </div>
            {salon.languages?.length ? (
              <div>
                <dt className="text-foreground/50">Languages</dt>
                <dd className="mt-1 font-medium text-foreground">{salon.languages.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        {salon.socialLinks ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
              Connect
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {salon.socialLinks.instagram ? (
                <a
                  href={salon.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className={socialClass}
                >
                  <InstagramIcon className="size-4" />
                  Instagram
                </a>
              ) : null}
              {salon.socialLinks.facebook ? (
                <a
                  href={salon.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className={socialClass}
                >
                  <FacebookIcon className="size-4" />
                  Facebook
                </a>
              ) : null}
              {salon.socialLinks.website ? (
                <a
                  href={salon.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className={socialClass}
                >
                  <SparklesIcon className="size-4" />
                  Website
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  )
}

const socialClass = cn(
  "inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-sm font-medium text-foreground/75 transition hover:border-primary/30 hover:bg-primary/5",
)
