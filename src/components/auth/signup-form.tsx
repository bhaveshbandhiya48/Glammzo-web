"use client"

import Link from "next/link"
import { Loader2Icon } from "lucide-react"

import { usePhoneOtpAuth } from "@/components/auth/use-phone-otp-auth"
import { signupRequestOtpAction, signupVerifyOtpAction } from "@/lib/auth/auth-actions"
import { isFailedAuthState } from "@/lib/auth/auth-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignupForm({ nextPath }: { nextPath: string }) {
  const {
    step,
    activeState,
    requestState,
    verifyState,
    isPending,
    handleSubmit,
    resetToPhone,
    otpSentMessage,
  } = usePhoneOtpAuth({
    requestOtp: signupRequestOtpAction,
    verifyOtp: signupVerifyOtpAction,
  })

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="max-w-md">
        <div className="font-heading text-2xl font-semibold tracking-tight">
          Create your account
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground/65">
          Use your mobile number. We&apos;ll verify it with a one-time code.
        </p>
      </div>

      <Card className="mt-7 rounded-3xl">
        <CardContent className="px-6 py-7">
          <form onSubmit={handleSubmit} className="grid gap-4">
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
                      el.value = el.value.replace(/\D/g, "").slice(0, 10)
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
                <p className="text-sm text-foreground/60">
                  {otpSentMessage || "Enter the 6-digit code we sent to your mobile number."}
                </p>
                <Input
                  id="otp"
                  name="otp"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  placeholder="6-digit code"
                  title="Enter the 6-digit code"
                  autoFocus
                  onInput={(e) => {
                    const el = e.currentTarget
                    el.value = el.value.replace(/\D/g, "").slice(0, 6)
                  }}
                  aria-invalid={Boolean(!activeState.ok && activeState.fieldErrors?.otp) || undefined}
                />
                {!activeState.ok && activeState.fieldErrors?.otp ? (
                  <p className="text-sm text-destructive">{activeState.fieldErrors.otp}</p>
                ) : null}
                {isFailedAuthState(requestState) && requestState.debugOtp ? (
                  <p className="text-xs text-foreground/55">
                    Dev OTP:{" "}
                    <span className="font-medium text-foreground">{requestState.debugOtp}</span>
                  </p>
                ) : null}
                {isFailedAuthState(verifyState) && verifyState.debugOtp ? (
                  <p className="text-xs text-foreground/55">
                    Dev OTP:{" "}
                    <span className="font-medium text-foreground">{verifyState.debugOtp}</span>
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={resetToPhone}
                  className="text-left text-sm font-medium text-foreground/70 underline underline-offset-4 hover:text-foreground"
                >
                  Use a different number
                </button>
              </div>
            )}

            {!activeState.ok && activeState.message && step === "phone" ? (
              <p className="text-sm text-destructive">{activeState.message}</p>
            ) : null}
            {!activeState.ok && activeState.message && step === "otp" ? (
              <p className="text-sm text-destructive">{activeState.message}</p>
            ) : null}

            <Button type="submit" className="h-11 rounded-xl" disabled={isPending}>
              {isPending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
              {step === "otp" ? "Verify & create account" : "Send code"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-foreground/60">
        Already have an account?{" "}
        <Link
          href={nextPath !== "/dashboard" ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}
          className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
