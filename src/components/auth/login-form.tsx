"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Loader2Icon } from "lucide-react"

import { requestOtpAction, verifyOtpAction } from "@/lib/auth/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AuthState =
  | { ok: true }
  | {
      ok: false
      message: string
      step?: "phone" | "otp"
      fieldErrors?: Partial<Record<string, string>>
      debugOtp?: string
    }

const initialState: AuthState = { ok: false, message: "" }

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [requestState, requestAction, requesting] = useActionState(requestOtpAction, initialState)
  const [verifyState, verifyAction, verifying] = useActionState(verifyOtpAction, initialState)
  const step = requestState.ok ? "phone" : requestState.step ?? "phone"

  const activeState = step === "otp" ? verifyState : requestState
  const pending = step === "otp" ? verifying : requesting
  const action = step === "otp" ? verifyAction : requestAction

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="max-w-md">
        <div className="font-heading text-2xl font-semibold tracking-tight">
          Sign in
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground/65">
          Use your mobile number to continue.
        </p>
      </div>

      <Card className="mt-7 rounded-3xl">
        <CardContent className="px-6 py-7">
          <form action={action} className="grid gap-4">
            <input type="hidden" name="next" value={nextPath} />

            {step === "phone" ? (
              <div className="grid gap-2">
                <Label htmlFor="phone">Mobile number</Label>
                <div className="flex">
                  <span className="inline-flex h-11 items-center rounded-l-xl border border-input bg-background/60 px-3 text-sm text-foreground/70">
                    +91
                  </span>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    minLength={10}
                    maxLength={10}
                    placeholder="10-digit mobile"
                    title="Enter a 10-digit mobile number"
                    className="rounded-l-none border-l-0"
                    onInput={(e) => {
                      const el = e.currentTarget
                      el.value = el.value.replace(/\\D/g, "").slice(0, 10)
                    }}
                    aria-invalid={
                      Boolean(!activeState.ok && activeState.fieldErrors?.phone) || undefined
                    }
                  />
                </div>
                {!activeState.ok && activeState.fieldErrors?.phone ? (
                  <p className="text-sm text-destructive">{activeState.fieldErrors.phone}</p>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  name="otp"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  placeholder="6-digit code"
                  title="Enter the 6-digit code"
                  onInput={(e) => {
                    const el = e.currentTarget
                    el.value = el.value.replace(/\\D/g, "").slice(0, 6)
                  }}
                  aria-invalid={Boolean(!activeState.ok && activeState.fieldErrors?.otp) || undefined}
                />
                {!activeState.ok && activeState.fieldErrors?.otp ? (
                  <p className="text-sm text-destructive">{activeState.fieldErrors.otp}</p>
                ) : null}
                {!requestState.ok && requestState.step === "otp" && requestState.debugOtp ? (
                  <p className="text-xs text-foreground/55">
                    Dev OTP:{" "}
                    <span className="font-medium text-foreground">{requestState.debugOtp}</span>
                  </p>
                ) : null}
                {verifyState.ok ? null : verifyState.debugOtp ? (
                  <p className="text-xs text-foreground/55">
                    Dev OTP:{" "}
                    <span className="font-medium text-foreground">{verifyState.debugOtp}</span>
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-left text-sm font-medium text-foreground/70 underline underline-offset-4 hover:text-foreground"
                >
                  Use a different number
                </button>
              </div>
            )}

            {!activeState.ok && activeState.message ? (
              <p className="text-sm text-destructive">{activeState.message}</p>
            ) : null}

            <Button
              type="submit"
              className="h-11 rounded-xl"
              disabled={pending}
            >
              {pending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
              {step === "otp" ? "Verify & continue" : "Send code"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-foreground/60">
        Don’t have an account?{" "}
        <Link
          href={nextPath !== "/dashboard" ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup"}
          className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
        >
          Create account
        </Link>
      </p>
    </div>
  )
}

