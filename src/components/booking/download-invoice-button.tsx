"use client"

import { useState, useTransition } from "react"
import { DownloadIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getBookingInvoicePdfUrlAction } from "@/lib/bookings/invoice-actions"
import { cn } from "@/lib/utils"

type DownloadInvoiceButtonProps = {
  appointmentId: string
  className?: string
  variant?: "default" | "outline"
}

export function DownloadInvoiceButton({
  appointmentId,
  className,
  variant = "outline",
}: DownloadInvoiceButtonProps) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className={cn("min-w-0", className)}>
      <Button
        type="button"
        size="sm"
        variant={variant}
        disabled={pending}
        className="h-9 w-full rounded-full px-4"
        onClick={() => {
          setError(null)
          startTransition(async () => {
            const result = await getBookingInvoicePdfUrlAction(appointmentId)
            if (!result.ok) {
              setError(result.message)
              return
            }
            window.open(result.pdfUrl, "_blank", "noopener,noreferrer")
          })
        }}
      >
        {pending ? (
          <Loader2Icon className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <DownloadIcon className="size-3.5" aria-hidden />
        )}
        {pending ? "Preparing…" : "Download invoice"}
      </Button>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
