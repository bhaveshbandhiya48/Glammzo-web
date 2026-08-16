"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Loader2Icon } from "lucide-react"

import {
  deleteAccountAction,
  type DeleteAccountActionState,
} from "@/lib/auth/profile-actions"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const CONFIRM_WORD = "DELETE"
const initialState: DeleteAccountActionState = { ok: true }

function DeleteSubmitButton({ disabled }: { disabled: boolean }) {
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
          Deleting…
        </>
      ) : (
        "Delete account"
      )}
    </Button>
  )
}

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState("")
  const [state, formAction] = useActionState(deleteAccountAction, initialState)

  const canSubmit = confirm.trim().toUpperCase() === CONFIRM_WORD

  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.04] p-5">
      <h3 className="text-base font-semibold text-foreground">Delete account</h3>
      <p className="mt-1.5 text-sm text-foreground/65">
        Permanently remove your Glammzo profile, wallet balance, loyalty credits, favorites,
        and push notifications. Booking history may be retained in anonymized form for salons
        and legal requirements.
      </p>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setConfirm("")
        }}
      >
        <DialogTrigger asChild>
          <Button type="button" variant="destructive" className="mt-4 rounded-full">
            Delete account
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader className="gap-2 pb-1">
            <DialogTitle className="text-xl">Delete your account?</DialogTitle>
            <DialogDescription>
              This cannot be undone. Type <span className="font-semibold">{CONFIRM_WORD}</span>{" "}
              to confirm.
            </DialogDescription>
          </DialogHeader>

          <form action={formAction} className="space-y-5 pt-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="delete-confirm">Confirmation</Label>
              <Input
                id="delete-confirm"
                name="confirm"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder={CONFIRM_WORD}
                autoComplete="off"
                autoCapitalize="characters"
                className="rounded-xl"
              />
            </div>

            {state.ok === false && state.message ? (
              <p className="text-sm text-destructive">{state.message}</p>
            ) : null}

            <DialogFooter className="gap-2 sm:gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="rounded-full">
                  Cancel
                </Button>
              </DialogClose>
              <DeleteSubmitButton disabled={!canSubmit} />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
