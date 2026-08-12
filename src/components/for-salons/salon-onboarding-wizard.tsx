"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  CalendarCheckIcon,
  CheckIcon,
  LayoutDashboardIcon,
  Loader2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
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

const SIDEBAR_POINTS = [
  {
    icon: LayoutDashboardIcon,
    title: "Instant CRM access",
    body: "Open your dashboard right after verification.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Online booking ready",
    body: "Publish when your services and staff are set.",
  },
  {
    icon: BadgeCheckIcon,
    title: "No card to begin",
    body: "Start free, complete your profile, go live later.",
  },
] as const

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
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:gap-12">
      <div className="min-w-0">
        <Link
          href="/for-salons"
          className="inline-flex items-center gap-1.5 text-sm text-foreground/60 transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to For Salons
        </Link>

        <ol className="mt-6 grid grid-cols-2 gap-3">
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
                    "mt-2 truncate text-xs font-medium",
                    current ? "text-foreground" : "text-foreground/45",
                  )}
                >
                  {item.label}
                </p>
              </li>
            )
          })}
        </ol>

        <div className="mt-6 rounded-xl border border-border/70 bg-card p-5 shadow-sm shadow-black/[0.03] sm:p-6">
          {step === "details" ? (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                runAction(submitSalonDetailsAction, new FormData(e.currentTarget))
              }}
            >
              {initialProgress?.intendedPlan ? (
                <input type="hidden" name="intendedPlan" value={initialProgress.intendedPlan} />
              ) : null}
              {initialProgress?.intendedPlan ? (
                <p className="rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-sm text-foreground/70">
                  Selected plan:{" "}
                  <span className="font-semibold capitalize text-foreground">
                    {initialProgress.intendedPlan === "starter"
                      ? "Free"
                      : initialProgress.intendedPlan}
                  </span>
                </p>
              ) : null}

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
                <Select
                  id="businessType"
                  name="businessType"
                  defaultValue={initialProgress?.businessType ?? ""}
                  placeholder="Select your business type"
                  className={cn(
                    "h-11 rounded-xl border-input bg-background/60 px-4 shadow-sm shadow-black/[0.02]",
                    state.fieldErrors?.businessType &&
                      "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                  )}
                >
                  <option value="" disabled>
                    Select your business type
                  </option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                {state.fieldErrors?.businessType ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.businessType}</p>
                ) : null}
              </div>

              {state.message && !state.ok ? (
                <p className="text-sm text-destructive">{state.message}</p>
              ) : null}

              <Button type="submit" size="lg" className="mt-2 w-full sm:w-auto" disabled={pending}>
                {pending ? <Loader2Icon className="size-4 animate-spin" /> : null}
                Continue
              </Button>
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
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
                {pending ? <Loader2Icon className="size-4 animate-spin" /> : null}
                Verify & open CRM
              </Button>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
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
              </div>
            </form>
          ) : null}
        </div>
      </div>

      <aside className="rounded-xl border border-border/70 bg-muted/20 p-5 sm:p-6 lg:sticky lg:top-24">
        <p className="section-eyebrow">What you get</p>
        <h2 className="mt-3 font-heading text-xl font-semibold tracking-tight text-foreground">
          Open your CRM in minutes
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/60">
          Instant CRM access · Complete profile & publish later in the dashboard.
        </p>

        <ul className="mt-6 space-y-4">
          {SIDEBAR_POINTS.map((point) => (
            <li key={point.title} className="flex gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <point.icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{point.title}</p>
                <p className="mt-0.5 text-sm text-foreground/60">{point.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <ul className="mt-6 space-y-2 border-t border-border/60 pt-5">
          {["No credit card required", "Full Pro for 30 days", "CRM stays free after trial"].map(
            (item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-foreground/65">
                <CheckIcon className="size-3.5 shrink-0 text-primary" aria-hidden />
                {item}
              </li>
            ),
          )}
        </ul>
      </aside>
    </div>
  )
}
