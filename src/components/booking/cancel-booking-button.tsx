"use client"

import { useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { Loader2Icon } from "lucide-react"

import { cancelBookingAction } from "@/lib/bookings/actions"
import {
  CUSTOMER_CANCEL_REASON_OPTIONS,
  type CustomerCancelReasonId,
} from "@/lib/bookings/booking-status"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type CancelBookingButtonProps = {
  bookingId: string
}

function CancelSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="destructive"
      className="rounded-full"
      disabled={disabled || pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
          Cancelling…
        </>
      ) : (
        "Confirm cancellation"
      )}
    </Button>
  )
}

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const [open, setOpen] = useState(false)
  const [reasonId, setReasonId] = useState<CustomerCancelReasonId | "">("")
  const [details, setDetails] = useState("")
  const [isPending, startTransition] = useTransition()

  const detailsRequired = reasonId === "other"
  const detailsTrimmed = details.trim()
  const canSubmit =
    Boolean(reasonId) && (!detailsRequired || detailsTrimmed.length >= 3)

  const resetForm = () => {
    setReasonId("")
    setDetails("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-9 rounded-full px-4">
          Cancel
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader className="gap-2 pb-1">
          <DialogTitle className="text-xl">Cancel this booking?</DialogTitle>
          <DialogDescription>
            Tell us why you&apos;re cancelling so the salon can update their schedule.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5 pt-2"
          action={(formData) => {
            startTransition(async () => {
              await cancelBookingAction(formData)
            })
          }}
        >
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="cancelReason" value={reasonId} />

          <fieldset className="space-y-2.5">
            <legend className="text-sm font-medium text-foreground/80">
              Reason for cancelling
            </legend>
            <div className="flex flex-wrap gap-2">
              {CUSTOMER_CANCEL_REASON_OPTIONS.map((option) => {
                const selected = reasonId === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setReasonId(option.id)}
                    className={cn(
                      "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/80 bg-background text-foreground/70 hover:border-border hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="space-y-2.5">
            <Label htmlFor={`cancel-details-${bookingId}`} className="block leading-normal">
              {detailsRequired ? "Please share more details" : "Additional details (optional)"}
            </Label>
            <textarea
              id={`cancel-details-${bookingId}`}
              name="cancelDetails"
              rows={3}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder={
                detailsRequired
                  ? "Tell us a bit more…"
                  : "Anything else the salon should know?"
              }
              className={cn(
                "mt-1 w-full resize-none rounded-xl border border-input bg-background/60 px-3.5 py-2.5 text-sm shadow-sm shadow-black/[0.02] outline-none transition-colors",
                "placeholder:text-muted-foreground",
                "focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20",
              )}
              required={detailsRequired}
              minLength={detailsRequired ? 3 : undefined}
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-full" disabled={isPending}>
                Keep booking
              </Button>
            </DialogClose>
            <CancelSubmitButton disabled={!canSubmit} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
