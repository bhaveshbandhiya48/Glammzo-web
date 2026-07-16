"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { ArrowLeftIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BUSINESS_TYPES,
  type OnboardingActionState,
  type OnboardingStep,
  type SalonOnboardingProgress,
} from "@/lib/salon-onboarding/constants"
import {
  resendOnboardingOtpAction,
  submitSalonDetailsAction,
  verifyOnboardingOtpAction,
} from "@/lib/salon-onboarding/actions"
import { getSignupCityOptions } from "@/lib/salon-onboarding/india"
import { cn } from "@/lib/utils"

const STEPS: Array<{ id: OnboardingStep; label: string }> = [
  { id: "details", label: "Salon details" },
  { id: "otp", label: "Verify mobile" },
]

const CITY_OPTIONS = getSignupCityOptions()

const initialState: OnboardingActionState = { ok: false }

function stepIndex(step: OnboardingStep) {
  const idx = STEPS.findIndex((s) => s.id === step)
  return idx === -1 ? 0 : idx
}

export function SalonOnboardingWizard({
  initialProgress,
}: {
  initialProgress: SalonOnboardingProgress | null
}) {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>(
    initialProgress?.step === "otp" ? "otp" : "details",
  )
  const [state, setState] = useState<OnboardingActionState>(initialState)
  const [cityFilter, setCityFilter] = useState(initialProgress?.city ?? "")
  const [pending, startTransition] = useTransition()
  const [resending, startResend] = useTransition()

  const filteredCities = useMemo(() => {
    const q = cityFilter.trim().toLowerCase()
    if (!q) return CITY_OPTIONS.slice(0, 12)
    return CITY_OPTIONS.filter((city) => city.toLowerCase().includes(q)).slice(0, 12)
  }, [cityFilter])

  function runAction(
    action: (prev: OnboardingActionState, formData: FormData) => Promise<OnboardingActionState>,
    formData: FormData,
  ) {
    startTransition(async () => {
      const result = await action(state, formData)
      setState(result)
      if (result.step) setStep(result.step)

      if (result.ok && result.step === "done" && result.crmHandoffUrl) {
        sessionStorage.setItem("glamzzo_crm_handoff", result.crmHandoffUrl)
        router.push(result.welcomePath || "/for-salons/welcome")
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-8">
        <Link
          href="/for-salons"
          className="inline-flex items-center gap-1.5 text-sm text-foreground/60 transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back
        </Link>
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Create your salon account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground/60">
          Same quick signup as Glammzo CRM — then finish your business profile inside the dashboard.
        </p>
      </div>

      <ol className="mb-8 grid grid-cols-2 gap-2">
        {STEPS.map((item, index) => {
          const active = stepIndex(step)
          const done = index < active
          const current = index === active
          return (
            <li key={item.id} className="min-w-0">
              <div
                className={cn(
                  "flex h-1.5 rounded-full transition-colors",
                  done || current ? "bg-primary" : "bg-border",
                )}
              />
              <p
                className={cn(
                  "mt-2 truncate text-[11px] font-medium",
                  current ? "text-foreground" : "text-foreground/45",
                )}
              >
                {item.label}
              </p>
            </li>
          )
        })}
      </ol>

      <div className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6 shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.02] sm:p-8">
        {step === "details" ? (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              runAction(submitSalonDetailsAction, new FormData(e.currentTarget))
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                name="businessName"
                defaultValue={initialProgress?.businessName}
                placeholder="e.g. Bloom Salon"
                className="h-11 rounded-xl"
                required
              />
              {state.fieldErrors?.businessName ? (
                <p className="text-sm text-destructive">{state.fieldErrors.businessName}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ownerName">Owner name</Label>
              <Input
                id="ownerName"
                name="ownerName"
                defaultValue={initialProgress?.ownerName}
                placeholder="Your full name"
                className="h-11 rounded-xl"
                required
              />
              {state.fieldErrors?.ownerName ? (
                <p className="text-sm text-destructive">{state.fieldErrors.ownerName}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile number</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                defaultValue={initialProgress?.mobile?.replace(/^\+91/, "")}
                placeholder="10-digit mobile"
                className="h-11 rounded-xl"
                required
              />
              {state.fieldErrors?.mobile ? (
                <p className="text-sm text-destructive">{state.fieldErrors.mobile}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Start typing your city"
                className="h-11 rounded-xl"
                autoComplete="off"
                required
              />
              {cityFilter.trim().length >= 1 &&
              !CITY_OPTIONS.some((c) => c.toLowerCase() === cityFilter.trim().toLowerCase()) ? (
                <ul className="max-h-40 overflow-auto rounded-xl border border-border/70 bg-background">
                  {filteredCities.map((city) => (
                    <li key={city}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted/60"
                        onClick={() => setCityFilter(city)}
                      >
                        {city}
                      </button>
                    </li>
                  ))}
                  {filteredCities.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-foreground/50">No matching cities</li>
                  ) : null}
                </ul>
              ) : null}
              {state.fieldErrors?.city ? (
                <p className="text-sm text-destructive">{state.fieldErrors.city}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="businessType">Business type</Label>
              <select
                id="businessType"
                name="businessType"
                defaultValue={initialProgress?.businessType ?? ""}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                required
              >
                <option value="" disabled>
                  Select your business type
                </option>
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.businessType ? (
                <p className="text-sm text-destructive">{state.fieldErrors.businessType}</p>
              ) : null}
            </div>

            {state.message && !state.ok ? (
              <p className="text-sm text-destructive">{state.message}</p>
            ) : null}

            <Button type="submit" size="lg" className="mt-2" disabled={pending}>
              {pending ? <Loader2Icon className="size-4 animate-spin" /> : null}
              Continue
            </Button>
            <p className="text-center text-xs text-foreground/50">
              Instant CRM access · Complete profile & publish later in the dashboard
            </p>
          </form>
        ) : null}

        {step === "otp" ? (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              runAction(verifyOnboardingOtpAction, new FormData(e.currentTarget))
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="otp">Verification code</Label>
              <p className="text-sm text-foreground/60">
                Enter the 6-digit code we sent
                {state.maskedMobile ? ` to ${state.maskedMobile}` : " to your mobile"}.
              </p>
              <Input
                id="otp"
                name="otp"
                inputMode="numeric"
                maxLength={6}
                className="h-12 rounded-xl tracking-[0.3em]"
                required
              />
              {state.fieldErrors?.otp ? (
                <p className="text-sm text-destructive">{state.fieldErrors.otp}</p>
              ) : null}
              {state.debugOtp ? (
                <p className="text-xs text-foreground/55">
                  Dev OTP: <span className="font-medium text-foreground">{state.debugOtp}</span>
                </p>
              ) : null}
            </div>
            {state.message && !state.ok ? (
              <p className="text-sm text-destructive">{state.message}</p>
            ) : null}
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? <Loader2Icon className="size-4 animate-spin" /> : null}
              Verify & open CRM
            </Button>
            <button
              type="button"
              disabled={resending || pending}
              className="text-sm font-medium text-foreground/70 underline underline-offset-4 hover:text-foreground disabled:opacity-50"
              onClick={() => {
                startResend(async () => {
                  const result = await resendOnboardingOtpAction()
                  setState(result)
                  if (result.step) setStep(result.step)
                })
              }}
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
            <button
              type="button"
              className="text-sm text-foreground/55 underline underline-offset-4 hover:text-foreground"
              onClick={() => {
                setStep("details")
                setState(initialState)
              }}
            >
              Use different details
            </button>
          </form>
        ) : null}
      </div>
    </div>
  )
}
