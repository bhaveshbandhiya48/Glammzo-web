"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LeaveReviewForm } from "@/components/reviews/leave-review-form"

export function LeaveReviewDialog({ appointmentId, salonName }: { appointmentId: string; salonName: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="rounded-full">
          Leave a review
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {salonName}</DialogTitle>
          <DialogDescription>
            Your rating helps others discover the right salon. This will be marked as a verified visit.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <LeaveReviewForm appointmentId={appointmentId} salonName={salonName} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

