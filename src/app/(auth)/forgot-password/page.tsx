"use client"

import Link from "next/link"
import { useActionState } from "react"
import { CheckCircle2Icon, Loader2Icon } from "lucide-react"

import { requestPasswordResetAction } from "@/lib/auth/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AuthState =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Partial<Record<string, string>> }

const initialState: AuthState = { ok: false, message: "" }

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialState)

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="max-w-md">
        <div className="font-heading text-2xl font-semibold tracking-tight">
          Reset your password
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground/65">
          We’ll email you a link to reset your password.
        </p>
      </div>

      <Card className="mt-7 rounded-3xl">
        <CardContent className="px-6 py-7">
          {state.ok ? (
            <div className="grid gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80">
                <CheckCircle2Icon className="size-4 text-foreground/70" />
                Check your inbox
              </div>
              <p className="text-sm leading-6 text-foreground/65">
                If an account exists for that email, we sent a reset link.
              </p>
              <Button asChild className="h-11 rounded-xl">
                <Link href="/login">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <form action={action} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  aria-invalid={Boolean(state.fieldErrors?.email) || undefined}
                />
                {state.fieldErrors?.email ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
                ) : null}
              </div>

              {state.message ? (
                <p className="text-sm text-destructive">{state.message}</p>
              ) : null}

              <Button type="submit" className="h-11 rounded-xl" disabled={pending}>
                {pending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
                Send reset link
              </Button>

              <p className="text-sm text-foreground/60">
                Remembered it?{" "}
                <Link
                  href="/login"
                  className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

