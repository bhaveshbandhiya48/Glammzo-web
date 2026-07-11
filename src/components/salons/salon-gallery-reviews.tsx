"use client"

import Image from "next/image"
import Link from "next/link"
import { BadgeCheckIcon, StarIcon } from "lucide-react"

import type { SalonReview, SalonTeamMember } from "@/types/salon"
import { SalonTeamPanel } from "@/components/salons/salon-team-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type SalonGalleryReviewsProps = {
  gallery: string[]
  reviews: SalonReview[]
  team: SalonTeamMember[]
  rating: number
  reviewCount: number
  salonName: string
}

function StarRating({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-4",
            i < Math.round(value) ? "fill-primary text-primary" : "fill-muted text-muted-foreground/25"
          )}
        />
      ))}
    </span>
  )
}

function guestInitials(authorName: string) {
  return authorName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function ReviewCard({ review }: { review: SalonReview }) {
  const guestInitialsLabel = guestInitials(review.authorName)

  return (
    <article
      className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm shadow-black/[0.03] sm:p-6"
      aria-label={`Review by ${review.authorName} (${review.userId}) for ${review.staffMember.name}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary"
            aria-hidden
          >
            {guestInitialsLabel}
          </span>
          <div>
            <p className="font-heading text-base font-semibold tracking-tight">{review.authorName}</p>
            <p className="text-sm text-foreground/55">{review.reviewType}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating value={review.rating} />
          {review.verified ? (
            <span className="inline-flex items-center gap-1 text-xs text-foreground/50">
              <BadgeCheckIcon className="size-3.5 text-primary" />
              Verified visit
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-sm text-foreground/55">
        Review for{" "}
        <span className="font-medium text-foreground/75">{review.staffMember.name}</span>
        <span aria-hidden> · </span>
        {review.staffMember.role}
      </p>

      <p className="mt-4 text-[15px] leading-7 text-foreground/75">{review.comment}</p>

      <footer className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground/50">
        <span>{review.date}</span>
        <span aria-hidden>·</span>
        <span>{review.serviceName}</span>
      </footer>
    </article>
  )
}

function GalleryGrid({ gallery, salonName }: { gallery: string[]; salonName: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {gallery.map((src) => (
        <div
          key={src}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/70 shadow-sm shadow-black/[0.03]"
        >
          <Image src={src} alt={`${salonName} gallery`} fill className="object-cover" sizes="50vw" />
        </div>
      ))}
    </div>
  )
}

function ReviewsPanel({
  reviews,
  rating,
  reviewCount,
  salonName,
}: {
  reviews: SalonReview[]
  rating: number
  reviewCount: number
  salonName: string
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-border/70 bg-card/80 px-5 py-4 shadow-sm shadow-black/[0.03] sm:px-6">
        <div>
          <p className="font-heading text-4xl font-semibold tracking-tight">{rating.toFixed(1)}</p>
          <StarRating value={rating} className="mt-1" />
        </div>
        <div className="h-10 w-px bg-border/80 max-sm:hidden" aria-hidden />
        <div>
          <p className="font-heading text-lg font-semibold">Team reviews</p>
          <p className="mt-1 text-sm text-foreground/60">
            Based on {reviewCount.toLocaleString()} ratings for {salonName}. Verified visits are marked with a check badge.
          </p>
        </div>
      </div>
      <ul className="grid gap-4">
        {reviews.map((review) => (
          <li key={review.id}>
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const tabTriggerClass =
  "rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"

export function SalonGalleryReviews({
  gallery,
  reviews,
  team,
  rating,
  reviewCount,
  salonName,
}: SalonGalleryReviewsProps) {
  const hasGallery = gallery.length > 0
  const hasReviews = reviews.length > 0
  const hasTeam = team.length > 0

  if (!hasGallery && !hasReviews && !hasTeam) return null

  const tabs: { value: string; label: string }[] = []
  if (hasGallery) tabs.push({ value: "gallery", label: "Gallery" })
  if (hasTeam) tabs.push({ value: "team", label: "Team Members" })
  if (hasReviews) tabs.push({ value: "reviews", label: "Reviews" })

  const defaultTab = tabs[0]?.value ?? "gallery"
  const showTabs = tabs.length > 1

  if (!showTabs) {
    if (hasGallery) return <GalleryGrid gallery={gallery} salonName={salonName} />
    if (hasTeam) {
      return (
        <div id="team">
          <SalonTeamPanel team={team} salonName={salonName} />
        </div>
      )
    }
    return (
      <ReviewsPanel
        reviews={reviews}
        rating={rating}
        reviewCount={reviewCount}
        salonName={salonName}
      />
    )
  }

  return (
    <Tabs defaultValue={defaultTab} className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TabsList className="h-11 rounded-full bg-card/80 p-1 ring-1 ring-border/60">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className={tabTriggerClass}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {hasReviews ? (
          <p className="text-sm text-foreground/55">
            {reviewCount.toLocaleString()} ratings · {rating.toFixed(1)} average
          </p>
        ) : null}
      </div>

      {hasGallery ? (
        <TabsContent value="gallery" className="mt-0">
          <GalleryGrid gallery={gallery} salonName={salonName} />
        </TabsContent>
      ) : null}

      {hasTeam ? (
        <TabsContent value="team" className="mt-0">
          <SalonTeamPanel team={team} salonName={salonName} />
        </TabsContent>
      ) : null}

      {hasReviews ? (
        <TabsContent value="reviews" className="mt-0">
          <ReviewsPanel
            reviews={reviews}
            rating={rating}
            reviewCount={reviewCount}
            salonName={salonName}
          />
        </TabsContent>
      ) : null}
    </Tabs>
  )
}
