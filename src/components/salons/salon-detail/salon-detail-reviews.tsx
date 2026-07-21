"use client"

import { useMemo, useState } from "react"
import { BadgeCheckIcon, StarIcon, ThumbsUpIcon } from "lucide-react"

import type { SalonReview } from "@/types/salon"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function StarRating({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-4",
            i < Math.round(value) ? "fill-primary text-primary" : "fill-muted text-muted-foreground/25",
          )}
        />
      ))}
    </span>
  )
}

function ratingDistribution(reviews: SalonReview[]) {
  const buckets = [0, 0, 0, 0, 0]
  for (const review of reviews) {
    const index = Math.min(5, Math.max(1, Math.round(review.rating))) - 1
    buckets[index] = (buckets[index] ?? 0) + 1
  }
  return buckets.map((count, index) => ({ stars: index + 1, count }))
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
  const [helpful, setHelpful] = useState(false)

  return (
    <article className="rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm transition duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary"
            aria-hidden
          >
            {guestInitials(review.authorName)}
          </span>
          <div>
            <p className="font-heading text-base font-semibold">{review.authorName}</p>
            <p className="text-sm text-foreground/55">{review.date}</p>
          </div>
        </div>
        <StarRating value={review.rating} />
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">{review.comment}</p>

      <p className="mt-3 text-sm text-foreground/55">
        {review.serviceName}
        {review.verified ? (
          <span className="ml-2 inline-flex items-center gap-1 text-primary">
            <BadgeCheckIcon className="size-3.5" />
            Verified visit
          </span>
        ) : null}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <Button
          type="button"
          variant={helpful ? "secondary" : "outline"}
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setHelpful(true)}
        >
          <ThumbsUpIcon className="size-3.5" />
          Helpful
        </Button>
      </div>
    </article>
  )
}

type SalonDetailReviewsProps = {
  reviews: SalonReview[]
  rating: number
  reviewCount: number
  salonName: string
}

export function SalonDetailReviews({
  reviews,
  rating,
  reviewCount,
  salonName,
}: SalonDetailReviewsProps) {
  const distribution = useMemo(() => ratingDistribution(reviews), [reviews])
  const maxBucket = Math.max(1, ...distribution.map((row) => row.count))

  if (reviews.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-6 py-12 text-center text-sm text-foreground/55">
        Reviews from verified visits will appear here for {salonName}.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm lg:grid-cols-[220px_1fr] lg:items-center">
        <div className="text-center lg:text-left">
          <p className="font-heading text-5xl font-semibold tracking-tight">
            {rating > 0 ? rating.toFixed(1) : "—"}
          </p>
          <StarRating value={rating} className="mt-2 justify-center lg:justify-start" />
          <p className="mt-2 text-sm text-foreground/55">
            {reviewCount.toLocaleString()} reviews
          </p>
        </div>
        <ul className="space-y-2" aria-label="Rating distribution">
          {distribution
            .slice()
            .reverse()
            .map((row) => (
              <li key={row.stars} className="flex items-center gap-3 text-sm">
                <span className="w-8 tabular-nums text-foreground/55">{row.stars}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${(row.count / maxBucket) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right tabular-nums text-foreground/45">{row.count}</span>
              </li>
            ))}
        </ul>
      </div>

      <ul className="grid gap-4 lg:grid-cols-2">
        {reviews.map((review) => (
          <li key={review.id}>
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>
    </div>
  )
}
