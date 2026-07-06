"use client"

import Link from "next/link"
import { useActionState } from "react"
import { AppleIcon, Loader2Icon } from "lucide-react"

import { loginAction } from "@/lib/auth/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AuthState =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Partial<Record<string, string>> }

const initialState: AuthState = { ok: false, message: "" }

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(loginAction, initialState)

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="max-w-md">
        <div className="font-heading text-2xl font-semibold tracking-tight">
          Sign in
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground/65">
          Use your email, or continue with a provider.
        </p>
      </div>

      <div className="mt-7 grid gap-3">
        <Button variant="outline" className="h-11 justify-center rounded-xl">
          <span className="mr-2 grid size-4 place-items-center rounded-sm bg-foreground/10 text-[10px] font-semibold text-foreground/70">
            G
          </span>
          Continue with Google
        </Button>
        <Button variant="outline" className="h-11 justify-center rounded-xl">
          <AppleIcon className="mr-2 size-4" />
          Continue with Apple
        </Button>
      </div>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-border/70" />
        <div className="text-xs font-medium text-foreground/50">or</div>
        <div className="h-px flex-1 bg-border/70" />
      </div>

      <Card className="rounded-3xl">
        <CardContent className="px-6 py-7">
          <form action={action} className="grid gap-4">
            <input type="hidden" name="next" value={nextPath} />

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
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-foreground/70 underline underline-offset-4 hover:text-foreground"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={Boolean(!state.ok && state.fieldErrors?.password) || undefined}
              />
              {!state.ok && state.fieldErrors?.password ? (
                <p className="text-sm text-destructive">{state.fieldErrors.password}</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-foreground/70">
                <Checkbox name="remember" />
                Remember me
              </label>
              <span className="text-sm text-foreground/50">Secure checkout</span>
            </div>

            {!state.ok && state.message ? (
              <p className="text-sm text-destructive">{state.message}</p>
            ) : null}

            <Button
              type="submit"
              className="h-11 rounded-xl"
              disabled={pending}
            >
              {pending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-foreground/60">
        Don’t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}

