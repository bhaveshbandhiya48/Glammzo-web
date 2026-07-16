"use client"

import { useFormStatus } from "react-dom"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BookingFormSubmitButtonsProps = {
  canSubmit: boolean
  submitLabel: string
}

export function BookingFormSubmitButtons({
  canSubmit,
  submitLabel,
}: BookingFormSubmitButtonsProps) {
  const { pending } = useFormStatus()
  const disabled = !canSubmit || pending
  const label = pending ? "Booking…" : submitLabel

  return (
    <>
      <Button
        type="submit"
        size="lg"
        className="mt-4 hidden w-full font-semibold md:inline-flex"
        disabled={disabled}
        aria-busy={pending}
      >
        {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
        {label}
      </Button>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 p-3 backdrop-blur-md md:hidden">
        <Button
          type="submit"
          size="lg"
          className="w-full font-semibold shadow-lg shadow-primary/15"
          disabled={disabled}
          aria-busy={pending}
        >
          {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
          {label}
        </Button>
      </div>
    </>
  )
}
