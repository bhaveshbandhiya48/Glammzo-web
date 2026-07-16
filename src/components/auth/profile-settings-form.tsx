"use client"

import { useActionState } from "react"

import {
  updateProfileAction,
  type ProfileActionState,
} from "@/lib/auth/profile-actions"
import { CONSUMER_GENDER_OPTIONS } from "@/lib/auth/consumer-profile-constants"
import { Button } from "@/components/ui/button"
import { DateInput } from "@/components/ui/date-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const initialState: ProfileActionState = { ok: true }

const fieldClassName =
  "h-11 w-full min-w-0 rounded-xl border border-input bg-background/60 px-4 py-2 text-base shadow-sm shadow-black/[0.02] transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

function formatGenderLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

type ProfileSettingsFormProps = {
  defaultName: string
  defaultEmail: string
  defaultPhone: string
  defaultGender: string
  defaultDateOfBirth: string
  defaultAddress: string
}

export function ProfileSettingsForm({
  defaultName,
  defaultEmail,
  defaultPhone,
  defaultGender,
  defaultDateOfBirth,
  defaultAddress,
}: ProfileSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState)

  return (
    <form action={formAction} className="space-y-5">
      <div className="flex flex-col gap-3">
        <Label htmlFor="name">Display name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={defaultName}
          placeholder="e.g. Priya Sharma"
          className="rounded-xl"
          autoComplete="name"
        />
        {state.ok === false && state.fieldErrors?.name ? (
          <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          placeholder="you@email.com"
          className="rounded-xl"
          autoComplete="email"
        />
        {state.ok === false && state.fieldErrors?.email ? (
          <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="phone">Mobile number</Label>
        <Input
          id="phone"
          name="phone"
          value={defaultPhone}
          disabled
          className="rounded-xl"
        />
        <p className="text-sm text-foreground/60">
          Your mobile number is verified at sign in and used for bookings.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Label htmlFor="gender">Gender</Label>
          <Select id="gender" name="gender" defaultValue={defaultGender} placeholder="Select gender">
            <option value="">Select gender</option>
            {CONSUMER_GENDER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {formatGenderLabel(option)}
              </option>
            ))}
          </Select>
          {state.ok === false && state.fieldErrors?.gender ? (
            <p className="text-sm text-destructive">{state.fieldErrors.gender}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <DateInput
            id="dateOfBirth"
            name="dateOfBirth"
            birthDate
            defaultValue={defaultDateOfBirth}
            placeholder="Select date of birth"
          />
          {state.ok === false && state.fieldErrors?.dateOfBirth ? (
            <p className="text-sm text-destructive">{state.fieldErrors.dateOfBirth}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="address">Address</Label>
        <textarea
          id="address"
          name="address"
          rows={3}
          defaultValue={defaultAddress}
          placeholder="e.g. 12, MG Road, Indiranagar, Bengaluru"
          className={cn(fieldClassName, "h-auto min-h-24 resize-y py-3")}
        />
        {state.ok === false && state.fieldErrors?.address ? (
          <p className="text-sm text-destructive">{state.fieldErrors.address}</p>
        ) : null}
      </div>

      {state.ok === false && state.message ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      {state.ok && state.saved ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">Profile saved.</p>
      ) : null}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  )
}
