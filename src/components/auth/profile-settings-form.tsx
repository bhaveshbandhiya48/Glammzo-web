"use client"

import { useActionState } from "react"

import {
  updateProfileAction,
  type ProfileActionState,
} from "@/lib/auth/profile-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: ProfileActionState = { ok: true }

type ProfileSettingsFormProps = {
  defaultName: string
  defaultEmail: string
  defaultPhone: string
}

export function ProfileSettingsForm({
  defaultName,
  defaultEmail,
  defaultPhone,
}: ProfileSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState)

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Display name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={defaultName}
          className="rounded-xl"
          autoComplete="name"
        />
        {state.ok === false && state.fieldErrors?.name ? (
          <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          className="rounded-xl"
          autoComplete="email"
        />
        {state.ok === false && state.fieldErrors?.email ? (
          <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Mobile number</Label>
        <Input
          id="phone"
          name="phone"
          value={defaultPhone}
          disabled
          className="rounded-xl"
        />
        <p className="text-sm text-foreground/60">
          Your mobile number is verified at sign-in and used for bookings.
        </p>
      </div>

      {state.ok === false && state.message ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      {state.ok ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">Profile saved.</p>
      ) : null}

      <Button type="submit" className="rounded-full" disabled={isPending}>
        {isPending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  )
}
