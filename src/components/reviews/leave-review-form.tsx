"use client"

import { useId } from "react"
import { StarIcon } from "lucide-react"

import { createSalonReviewAction } from "@/lib/reviews/actions"
import { SALON_REVIEW_TYPES } from "@/lib/reviews/review-types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function LeaveReviewForm({
  appointmentId,
  salonName,
}: {
  appointmentId: string
  salonName: string
}) {
  const formId = useId()

  return (
    <form action={createSalonReviewAction} className="space-y-4">
      <input type="hidden" name="appointmentId" value={appointmentId} />

      <div className="space-y-2">
        <Label htmlFor={`${formId}-rating`}>Rating</Label>
        <div className="flex items-center gap-2">
          <StarIcon className="size-4 text-primary" />
          <select
            id={`${formId}-rating`}
            name="rating"
            required
            defaultValue="5"
            className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const v = i + 1
              return (
                <option key={v} value={v}>
                  {v}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-reviewType`}>What should we rate?</Label>
        <select
          id={`${formId}-reviewType`}
          name="reviewType"
          required
          defaultValue={SALON_REVIEW_TYPES[4]}
          className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
        >
          {SALON_REVIEW_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-comment`}>Your review</Label>
        <textarea
          id={`${formId}-comment`}
          name="comment"
          rows={4}
          required
          maxLength={2000}
          placeholder="Share what you liked about your visit..."
          className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm shadow-xs outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
        />
      </div>

      <Button type="submit" className="rounded-full">
        Submit review
      </Button>

      <p className="text-xs text-foreground/45">
        Your review for {salonName} will be marked as verified.
      </p>
    </form>
  )
}

