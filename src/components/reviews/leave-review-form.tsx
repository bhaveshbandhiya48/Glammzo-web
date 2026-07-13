"use client"

import { useId, useState } from "react"
import { BadgeCheckIcon } from "lucide-react"

import { StarRatingInput } from "@/components/reviews/star-rating-input"
import { FormSubmitButton } from "@/components/ui/form-submit-button"
import { createSalonReviewAction } from "@/lib/reviews/actions"
import { SALON_REVIEW_TYPES, type SalonReviewType } from "@/lib/reviews/review-types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const DEFAULT_REVIEW_TYPE: SalonReviewType = "Overall experience"

export function LeaveReviewForm({
  appointmentId,
  salonName,
  staffName,
}: {
  appointmentId: string
  salonName: string
  staffName?: string
}) {
  const formId = useId()
  const [rating, setRating] = useState(5)
  const [reviewType, setReviewType] = useState<SalonReviewType>(DEFAULT_REVIEW_TYPE)
  const [comment, setComment] = useState("")
  const [includeStaffReview, setIncludeStaffReview] = useState(Boolean(staffName))

  const canSubmit = comment.trim().length >= 3

  return (
    <form action={createSalonReviewAction} className="space-y-8">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="reviewType" value={reviewType} />
      <input type="hidden" name="includeStaffReview" value={includeStaffReview ? "1" : "0"} />

      <section className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 px-4 py-5 sm:px-5">
        <Label className="block text-sm font-medium text-foreground/80">Overall rating</Label>
        <StarRatingInput
          id={`${formId}-rating`}
          name="rating"
          value={rating}
          onChange={setRating}
        />
      </section>

      <section className="space-y-4">
        <Label className="block text-sm font-medium text-foreground/80">What stood out?</Label>
        <div className="flex flex-wrap gap-2">
          {SALON_REVIEW_TYPES.map((type) => {
            const selected = reviewType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => setReviewType(type)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/80 bg-background text-foreground/70 hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {type}
              </button>
            )
          })}
        </div>
      </section>

      {staffName ? (
        <section className="rounded-2xl border border-border/70 bg-background px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <Checkbox
              id={`${formId}-include-staff`}
              checked={includeStaffReview}
              onCheckedChange={(checked) => setIncludeStaffReview(checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label htmlFor={`${formId}-include-staff`} className="cursor-pointer text-sm font-medium">
                Add review for {staffName}
              </Label>
              <p className="text-xs leading-relaxed text-foreground/55">
                Your feedback will appear on this team member&apos;s profile at the salon.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <Label htmlFor={`${formId}-comment`} className="block text-sm font-medium text-foreground/80">
          Write your review
        </Label>
        <textarea
          id={`${formId}-comment`}
          name="comment"
          rows={5}
          required
          minLength={3}
          maxLength={2000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Tell others about your experience, service quality, ambience, staff, and anything that would help them decide."
          className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring/50 focus-visible:ring-4 focus-visible:ring-ring/15"
        />
        <div className="flex items-center justify-between text-xs text-foreground/45">
          <span>Minimum 3 characters</span>
          <span>{comment.length}/2000</span>
        </div>
      </section>

      <section className="space-y-4 border-t border-border/60 pt-6">
        <FormSubmitButton
          className="h-11 w-full rounded-full"
          disabled={!canSubmit}
          pendingLabel="Posting…"
        >
          Post review
        </FormSubmitButton>
        <p className="flex items-center justify-center gap-1.5 text-xs text-foreground/45">
          <BadgeCheckIcon className="size-3.5 text-primary" aria-hidden />
          Verified visit at {salonName}
        </p>
      </section>
    </form>
  )
}
