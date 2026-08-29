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
import { cn } from "@/lib/utils"

export function LeaveReviewDialog({
  appointmentId,
  salonName,
  staffName,
  className,
}: {
  appointmentId: string
  salonName: string
  staffName?: string
  className?: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          className={cn("h-9 w-full rounded-full px-4", className)}
        >
          Leave a review
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader className="gap-2 pb-1">
          <DialogTitle className="text-xl">How was {salonName}?</DialogTitle>
          <DialogDescription>
            Share your experience to help others choose the right salon.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <LeaveReviewForm
            appointmentId={appointmentId}
            salonName={salonName}
            staffName={staffName}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
