"use client"

import { useFormStatus } from "react-dom"
import { AlertCircleIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BookingFormSubmitButtonsProps = {
  canSubmit: boolean
  submitLabel: string
  blockingReasons?: string[]
  showValidation?: boolean
}

export function BookingFormSubmitButtons({
  canSubmit,
  submitLabel,
  blockingReasons = [],
  showValidation = false,
}: BookingFormSubmitButtonsProps) {
  const { pending } = useFormStatus()
  const disabled = pending
  const label = pending ? "Booking…" : submitLabel
  const showBlockers = showValidation && !canSubmit && blockingReasons.length > 0

  return (
    <>
      {showBlockers ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-destructive/25 bg-destructive/[0.06] px-3.5 py-3"
        >
          <p className="flex items-start gap-2 text-sm font-medium text-destructive">
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            Fix these to continue
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-destructive/90">
            {blockingReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className={cn("mt-4 hidden w-full font-semibold md:inline-flex", showBlockers && "mt-3")}
        disabled={disabled}
        aria-busy={pending}
      >
        {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
        {label}
      </Button>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 p-3 backdrop-blur-md md:hidden">
        {showBlockers ? (
          <p className="mb-2 text-center text-xs font-medium text-destructive">
            {blockingReasons[0]}
            {blockingReasons.length > 1 ? ` · +${blockingReasons.length - 1} more` : ""}
          </p>
        ) : null}
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
