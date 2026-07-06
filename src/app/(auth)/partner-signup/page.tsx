"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Building2Icon, CheckCircle2Icon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type State =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Partial<Record<string, string>> }

const initialState: State = { ok: false, message: "" }

async function partnerSignupAction(_prev: State, formData: FormData): Promise<State> {
  const salonName = String(formData.get("salonName") ?? "").trim()
  const contactName = String(formData.get("contactName") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const city = String(formData.get("city") ?? "").trim()

  const fieldErrors: Record<string, string> = {}
  if (!salonName) fieldErrors.salonName = "Salon name is required."
  if (!contactName) fieldErrors.contactName = "Contact name is required."
  if (!email) fieldErrors.email = "Email is required."
  if (!city) fieldErrors.city = "City is required."

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please check the form.", fieldErrors }
  }

  // Production: create partner lead + send verification email.
  return { ok: true }
}

export default function PartnerSignupPage() {
  const [state, action, pending] = useActionState(partnerSignupAction, initialState)

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="max-w-md">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1 text-sm font-medium text-foreground/70 ring-1 ring-black/[0.05] backdrop-blur">
          <Building2Icon className="size-4" />
          Partner onboarding
        </div>
        <div className="mt-4 font-heading text-2xl font-semibold tracking-tight">
          Create a salon partner account
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground/65">
          Get discovered, reduce no‑shows, and manage bookings with a calm, modern toolkit.
        </p>
      </div>

      <Card className="mt-7 rounded-3xl">
        <CardContent className="px-6 py-7">
          {state.ok ? (
            <div className="grid gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80">
                <CheckCircle2Icon className="size-4 text-foreground/70" />
                Request received
              </div>
              <p className="text-sm leading-6 text-foreground/65">
                Thanks! We&apos;ll reach out shortly with next steps and a quick verification.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="h-11 rounded-xl">
                  <Link href="/">Back to home</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-xl">
                  <Link href="/partner/dashboard">Partner dashboard</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form action={action} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salonName">Salon name</Label>
                <Input
                  id="salonName"
                  name="salonName"
                  placeholder="e.g., Velvet & Co. Studio"
                  aria-invalid={Boolean(state.fieldErrors?.salonName) || undefined}
                />
                {state.fieldErrors?.salonName ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.salonName}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contactName">Contact name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  placeholder="Your name"
                  aria-invalid={Boolean(state.fieldErrors?.contactName) || undefined}
                />
                {state.fieldErrors?.contactName ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.contactName}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@salon.com"
                  aria-invalid={Boolean(state.fieldErrors?.email) || undefined}
                />
                {state.fieldErrors?.email ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="e.g., Bengaluru"
                  aria-invalid={Boolean(state.fieldErrors?.city) || undefined}
                />
                {state.fieldErrors?.city ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.city}</p>
                ) : null}
              </div>

              {state.message ? (
                <p className="text-sm text-destructive">{state.message}</p>
              ) : null}

              <Button type="submit" className="h-11 rounded-xl" disabled={pending}>
                {pending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
                Continue
              </Button>

              <p className="text-sm text-foreground/60">
                Looking to book appointments?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
                >
                  Create a customer account
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

