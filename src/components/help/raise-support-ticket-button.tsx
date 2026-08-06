"use client"

import { useState, useTransition } from "react"
import { Loader2Icon, TicketIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  submitSupportTicketAction,
  type SupportTicketState,
} from "@/lib/support/support-ticket-actions"
import { cn } from "@/lib/utils"

type RaiseSupportTicketButtonProps = {
  className?: string
  variant?: "default" | "outline" | "secondary"
  size?: "sm" | "md" | "lg"
}

export function RaiseSupportTicketButton({
  className,
  variant = "default",
  size = "md",
}: RaiseSupportTicketButtonProps) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<SupportTicketState | null>(null)
  const [pending, startTransition] = useTransition()

  function resetAndClose(next: boolean) {
    setOpen(next)
    if (!next) setState(null)
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn("rounded-full px-5", className)}
        onClick={() => setOpen(true)}
      >
        <TicketIcon className="size-4" aria-hidden />
        Raise a ticket
      </Button>

      <Dialog open={open} onOpenChange={resetAndClose}>
        <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
              Raise a support ticket
            </DialogTitle>
            <DialogDescription>
              Include your booking ID from the confirmation so we can assist faster. Our team will
              reply by email.
            </DialogDescription>
          </DialogHeader>

          {state?.ok ? (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-4 text-sm text-emerald-900">
              {state.message}
            </div>
          ) : (
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                const formData = new FormData(event.currentTarget)
                startTransition(async () => {
                  const result = await submitSupportTicketAction(state, formData)
                  setState(result)
                })
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="support-name">Your name</Label>
                <Input
                  id="support-name"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Full name"
                  className="h-11 rounded-xl"
                />
                {state && !state.ok && state.fieldErrors?.name ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
                ) : null}
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="support-email">Email</Label>
                  <Input
                    id="support-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-11 rounded-xl"
                  />
                  {state && !state.ok && state.fieldErrors?.email ? (
                    <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="support-phone">Mobile (optional)</Label>
                  <Input
                    id="support-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="10-digit mobile"
                    className="h-11 rounded-xl"
                  />
                  {state && !state.ok && state.fieldErrors?.phone ? (
                    <p className="text-sm text-destructive">{state.fieldErrors.phone}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="support-booking">Booking ID</Label>
                  <Input
                    id="support-booking"
                    name="bookingReference"
                    required
                    minLength={4}
                    placeholder="From your confirmation"
                    className="h-11 rounded-xl"
                  />
                  {state && !state.ok && state.fieldErrors?.bookingReference ? (
                    <p className="text-sm text-destructive">{state.fieldErrors.bookingReference}</p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="support-salon">Salon name (optional)</Label>
                  <Input
                    id="support-salon"
                    name="salonName"
                    placeholder="Where you booked"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="support-message">How can we help?</Label>
                <textarea
                  id="support-message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  placeholder="Describe the issue, and include appointment date/time if relevant."
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                {state && !state.ok && state.fieldErrors?.message ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.message}</p>
                ) : null}
              </div>

              {state && !state.ok ? (
                <p className="text-sm text-destructive">{state.message}</p>
              ) : null}

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => resetAndClose(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full" disabled={pending}>
                  {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
                  Submit ticket
                </Button>
              </DialogFooter>
            </form>
          )}

          {state?.ok ? (
            <DialogFooter>
              <Button type="button" className="rounded-full" onClick={() => resetAndClose(false)}>
                Done
              </Button>
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
