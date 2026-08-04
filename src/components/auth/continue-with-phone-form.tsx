"use client"

import Link from "next/link"
import { ArrowLeftIcon, Loader2Icon } from "lucide-react"

import { usePhoneOtpAuth } from "@/components/auth/use-phone-otp-auth"
import { requestOtpAction, verifyOtpAction } from "@/lib/auth/auth-actions"
import { isFailedAuthState } from "@/lib/auth/auth-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(-10)
  if (digits.length !== 10) return phone
  return `+91 ${digits.slice(0, 2)}••••${digits.slice(-4)}`
}

export function ContinueWithPhoneForm({ nextPath }: { nextPath: string }) {
  const {
    step,
    phone,
    activeState,
    requestState,
    verifyState,
    isPending,
    resendSeconds,
    handleSubmit,
    resetToPhone,
    resendCode,
    otpSentMessage,
  } = usePhoneOtpAuth({
    requestOtp: requestOtpAction,
    verifyOtp: verifyOtpAction,
  })

  const submitLabel = step === "otp" ? "Verify & continue" : "Send code"

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md flex-1 flex-col",
        "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both",
        "lg:block lg:flex-none",
      )}
    >
      <div className="flex-1 pt-4 lg:pt-0">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wide text-primary">Continue with mobile</p>
          <h2 className="font-heading text-[1.85rem] font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]">
            {step === "phone" ? "Enter your number" : "Enter the code"}
          </h2>
          <p className="text-sm leading-6 text-foreground/65">
            {step === "phone"
              ? "We'll text a one-time code. New here? Your account is created automatically."
              : otpSentMessage || `We sent a 6-digit code to ${maskPhone(phone)}.`}
          </p>
        </div>

        <form
          id="continue-with-phone"
          onSubmit={handleSubmit}
          className="mt-7 grid gap-5 lg:mt-8"
        >
          <input type="hidden" name="next" value={nextPath} />
          {step === "otp" ? <input type="hidden" name="phone" value={phone} /> : null}

          {step === "phone" ? (
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-foreground/80">
                Mobile number
              </Label>
              <div className="flex overflow-hidden rounded-2xl border border-input bg-white/80 shadow-sm shadow-black/[0.03] transition-[box-shadow,border-color] focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                <span className="inline-flex h-12 items-center border-r border-input/80 bg-muted/40 px-3.5 text-sm font-medium text-foreground/70">
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
                  autoFocus
                  className="h-12 rounded-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
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
            <div className="grid gap-3">
              <Label htmlFor="otp" className="text-foreground/80">
                Verification code
              </Label>
              <Input
                id="otp"
                name="otp"
                inputMode="numeric"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                placeholder="••••••"
                title="Enter the 6-digit code"
                autoFocus
                autoComplete="one-time-code"
                className="h-14 rounded-2xl bg-white/80 text-center font-heading text-2xl font-semibold tracking-[0.45em] placeholder:tracking-[0.35em] placeholder:text-foreground/25"
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

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={resetToPhone}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-foreground/65 transition-colors hover:text-foreground"
                >
                  <ArrowLeftIcon className="size-3.5" aria-hidden />
                  Change number
                </button>
                <button
                  type="button"
                  onClick={() => resendCode(nextPath)}
                  disabled={isPending || resendSeconds > 0}
                  className="min-h-11 text-sm font-medium text-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend code"}
                </button>
              </div>
            </div>
          )}

          {!activeState.ok && activeState.message && step === "phone" ? (
            <p className="text-sm text-destructive">{activeState.message}</p>
          ) : null}
          {!activeState.ok &&
          activeState.message &&
          step === "otp" &&
          !activeState.fieldErrors?.otp ? (
            <p className="text-sm text-destructive">{activeState.message}</p>
          ) : null}

          {/* Desktop CTA stays in-flow */}
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="hidden h-12 w-full text-[0.95rem] shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 lg:inline-flex"
          >
            {isPending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </form>

        <p className="mt-8 hidden text-center text-sm leading-6 text-foreground/55 lg:block">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="font-medium text-foreground/80 underline-offset-4 hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-foreground/80 underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <p className="mt-5 hidden text-center text-sm text-foreground/55 lg:block">
          Salon owner?{" "}
          <Link
            href="/for-salons/start"
            className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
          >
            Partner with Glammzo
          </Link>
        </p>
      </div>

      {/* Mobile: sticky app-style bottom action bar */}
      <div className="sticky bottom-0 z-10 -mx-5 mt-auto border-t border-border/50 bg-background/90 px-5 pt-3 backdrop-blur-md pb-[max(0.85rem,env(safe-area-inset-bottom))] lg:hidden">
        <Button
          type="submit"
          form="continue-with-phone"
          size="lg"
          disabled={isPending}
          className="h-12 w-full text-[0.95rem] shadow-md shadow-primary/25"
        >
          {isPending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
        <p className="mt-3 text-center text-[11px] leading-4 text-foreground/50">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="font-medium text-foreground/70 underline-offset-2 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-foreground/70 underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
