"use client"

import { useFormStatus } from "react-dom"
import { Loader2Icon } from "lucide-react"

import { cancelBookingAction } from "@/lib/bookings/actions"
import { Button } from "@/components/ui/button"

type CancelBookingButtonProps = {
  bookingId: string
}

function CancelSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      className="rounded-full"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
          Cancelling…
        </>
      ) : (
        "Cancel"
      )}
    </Button>
  )
}

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  return (
    <form action={cancelBookingAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <CancelSubmitButton />
    </form>
  )
}
