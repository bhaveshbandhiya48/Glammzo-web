"use client"

import Image from "next/image"
import { useState } from "react"
import { StarIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  formatStaffReviewCount,
  getTeamMemberReviews,
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

function TeamMemberTile({
  member,
  reviews,
  onOpen,
}: {
  member: SalonTeamMember
  reviews: SalonReview[]
  onOpen: () => void
}) {
  const { count, average } = resolveTeamMemberRating(member, reviews)
  const reviewLabel = formatStaffReviewCount(count)

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${member.name}'s profile`}
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card text-left shadow-sm shadow-black/[0.03] transition-colors hover:border-primary/35 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <Image
          src={member.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 160px"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-2.5 py-2">
        <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
          {member.name}
        </h3>
        <p className="mt-0.5 truncate text-[11px] font-medium text-primary">{member.role}</p>
        {reviewLabel && average != null ? (
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-foreground/55">
            <StarIcon className="size-3 fill-primary text-primary" aria-hidden />
            {average.toFixed(1)}
          </p>
        ) : null}
      </div>
    </button>
  )
}

function TeamMemberProfileSheet({
  member,
  reviews,
  salonName,
  open,
  onOpenChange,
}: {
  member: SalonTeamMember | null
  reviews: SalonReview[]
  salonName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  if (!member) return null

  const bio = member.bio?.trim()
  const specialties = member.specialties.filter(Boolean)
  const { count, average } = resolveTeamMemberRating(member, reviews)
  const reviewLabel = formatStaffReviewCount(count)
  const memberReviews = getTeamMemberReviews(member, reviews).slice(0, 3)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        showCloseButton={false}
        className={
          isDesktop
            ? "h-full w-[min(92vw,420px)] gap-0 overflow-hidden p-0"
            : "max-h-[92vh] gap-0 overflow-hidden rounded-t-3xl p-0"
        }
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="relative h-[180px] w-full shrink-0 overflow-hidden bg-muted sm:h-[220px]">
            <Image
              src={member.imageUrl}
              alt={`${member.name}, ${member.role}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 420px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close staff profile"
              className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-black/45 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <XIcon className="size-4" aria-hidden />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-5 py-5 sm:px-6">
            <SheetHeader className="space-y-2 p-0 text-left">
              <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                Staff profile
              </p>
              <SheetTitle className="font-heading text-xl leading-tight sm:text-2xl">
                {member.name}
              </SheetTitle>
              <SheetDescription className="text-sm font-medium text-primary">
                {member.role} · {salonName}
              </SheetDescription>
            </SheetHeader>

            {reviewLabel ? (
              <div className="mt-4 inline-flex items-center gap-2 text-sm text-foreground/70">
                {average != null ? <StarRating value={average} /> : null}
                {average != null ? (
                  <span className="font-semibold tabular-nums text-foreground">
                    {average.toFixed(1)}
                  </span>
                ) : null}
                <span>{reviewLabel}</span>
              </div>
            ) : null}

            {bio ? (
              <p className="mt-4 text-sm leading-relaxed text-foreground/75">{bio}</p>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-foreground/55">
                {member.name} is part of the specialist team at {salonName}.
              </p>
            )}

            {specialties.length > 0 ? (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                  Specializes in
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {specialties.map((service) => (
                    <li
                      key={service}
                      className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-xs text-foreground/75"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {memberReviews.length > 0 ? (
              <div className="mt-5 space-y-2.5">
                <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                  Recent reviews
                </p>
                <ul className="space-y-2.5">
                  {memberReviews.map((review) => (
                    <li
                      key={review.id}
                      className="rounded-xl border border-border/60 bg-background/70 px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {review.authorName}
                        </p>
                        <StarRating value={review.rating} />
                      </div>
                      {review.comment.trim() ? (
                        <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">
                          {review.comment}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[11px] text-foreground/45">
                        {review.serviceName}
                        {review.date ? ` · ${review.date}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-auto pt-5">
              <Button asChild type="button" variant="outline" className="w-full">
                <a href="#reviews" onClick={() => onOpenChange(false)}>
                  See all reviews
                </a>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function SalonTeamPanel({ team, salonName, reviews = [] }: SalonTeamPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  if (team.length === 0) return null

  const selected = team.find((member) => member.id === selectedId) ?? null

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/60">
        {team.length} team {team.length === 1 ? "member" : "members"} at {salonName}.
      </p>

      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {team.map((member) => (
          <li key={member.id}>
            <TeamMemberTile
              member={member}
              reviews={reviews}
              onOpen={() => setSelectedId(member.id)}
            />
          </li>
        ))}
      </ul>

      <TeamMemberProfileSheet
        member={selected}
        reviews={reviews}
        salonName={salonName}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      />
    </div>
  )
}
