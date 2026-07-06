"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Loader2Icon } from "lucide-react"

import { signupAction } from "@/lib/auth/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AuthState =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Partial<Record<string, string>> }

const initialState: AuthState = { ok: false, message: "" }

export default function SignupPage() {
  const [state, action, pending] = useActionState(signupAction, initialState)

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="max-w-md">
        <div className="font-heading text-2xl font-semibold tracking-tight">
          Create your account
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground/65">
          A calmer way to book, with favorites, reminders, and one-tap rebooking.
        </p>
      </div>

      <Card className="mt-7 rounded-3xl">
        <CardContent className="px-6 py-7">
          <form action={action} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                aria-invalid={Boolean(!state.ok && state.fieldErrors?.name) || undefined}
              />
              {!state.ok && state.fieldErrors?.name ? (
                <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={Boolean(!state.ok && state.fieldErrors?.email) || undefined}
              />
              {!state.ok && state.fieldErrors?.email ? (
                <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                aria-invalid={Boolean(!state.ok && state.fieldErrors?.password) || undefined}
              />
              {!state.ok && state.fieldErrors?.password ? (
                <p className="text-sm text-destructive">{state.fieldErrors.password}</p>
              ) : null}
            </div>

            {!state.ok && state.message ? (
              <p className="text-sm text-destructive">{state.message}</p>
            ) : null}

            <Button type="submit" className="h-11 rounded-xl" disabled={pending}>
              {pending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
              Create account
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-foreground/60">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

