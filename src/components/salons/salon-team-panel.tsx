import Image from "next/image"
import Link from "next/link"
import { StarIcon } from "lucide-react"

import {
  formatStaffReviewCount,
  resolveTeamMemberRating,
} from "@/lib/salons/staff-review-counts"
import type { SalonReview, SalonTeamMember } from "@/types/salon"
import { cn } from "@/lib/utils"

type SalonTeamPanelProps = {
  team: SalonTeamMember[]
  salonName: string
  reviews?: SalonReview[]
}

function StarRating({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-3.5",
            i < Math.round(value)
              ? "fill-primary text-primary"
              : "fill-muted text-muted-foreground/25",
          )}
        />
      ))}
    </span>
  )
}

function TeamMemberCard({
  member,
  reviews,
}: {
  member: SalonTeamMember
  reviews: SalonReview[]
}) {
  const bio = member.bio?.trim()
  const specialties = member.specialties.filter(Boolean)
  const { count, average } = resolveTeamMemberRating(member, reviews)
  const reviewLabel = formatStaffReviewCount(count)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/[0.03]">
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-muted">
        <Image
          src={member.imageUrl}
          alt={`${member.name}, ${member.role}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 280px"
        />
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-semibold tracking-tight text-foreground">
              {member.name}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-primary">{member.role}</p>
          </div>

          {reviewLabel ? (
            <Link
              href="#reviews"
              className="flex shrink-0 flex-col items-end gap-1 text-right transition hover:text-primary"
              aria-label={`${reviewLabel} for ${member.name}`}
            >
              {average != null ? (
                <StarRating value={average} />
              ) : (
                <StarIcon className="size-3.5 fill-primary/90 text-primary/90" aria-hidden />
              )}
              <span className="text-xs font-medium text-foreground/60">{reviewLabel}</span>
            </Link>
          ) : null}
        </div>

        {bio ? (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/65">{bio}</p>
        ) : specialties.length > 0 ? (
          <div className="mt-3 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
              Specializes in
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-1">
              {specialties.map((service) => (
                <li
                  key={service}
                  className="rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-[11px] leading-snug text-foreground/75"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function SalonTeamPanel({ team, salonName, reviews = [] }: SalonTeamPanelProps) {
  if (team.length === 0) return null

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/60">
        {team.length} team {team.length === 1 ? "member" : "members"} at {salonName}.
      </p>

      <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {team.map((member) => (
          <li key={member.id}>
            <TeamMemberCard member={member} reviews={reviews} />
          </li>
        ))}
      </ul>
    </div>
  )
}
