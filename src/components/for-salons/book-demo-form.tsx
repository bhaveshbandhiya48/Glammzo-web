"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import {
  ArrowLeftIcon,
  CalendarCheckIcon,
  CheckCircle2Icon,
  Loader2Icon,
  PhoneIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { trackEvent } from "@/lib/analytics/track-event"
import {
  type BookDemoState,
  submitBookDemoAction,
} from "@/lib/demo/book-demo-actions"
import { BUSINESS_TYPES } from "@/lib/salon-onboarding/constants"
import { getSignupCityOptions } from "@/lib/salon-onboarding/india"
import { cn } from "@/lib/utils"

const CITY_OPTIONS = getSignupCityOptions()

const SIDEBAR_POINTS = [
  {
    icon: CalendarCheckIcon,
    title: "See Glammzo in action",
    body: "Walk through marketplace booking, CRM, and partner tools live.",
  },
  {
    icon: PhoneIcon,
    title: "We call you back",
    body: "Share your details and our team schedules a short demo on your time.",
  },
] as const

export function BookDemoForm() {
  const [state, setState] = useState<BookDemoState | null>(null)
  const [cityFilter, setCityFilter] = useState("")
  const [pending, startTransition] = useTransition()

  const filteredCities = useMemo(() => {
    const q = cityFilter.trim().toLowerCase()
    if (!q) return CITY_OPTIONS.slice(0, 12)
    return CITY_OPTIONS.filter((city) => city.toLowerCase().includes(q)).slice(0, 12)
  }, [cityFilter])

  if (state?.ok) {
    return (
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:gap-12">
        <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm shadow-black/[0.03] sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/12 text-primary">
            <CheckCircle2Icon className="size-6" aria-hidden />
          </div>
          <h2 className="mt-5 font-heading text-2xl font-semibold tracking-tight">
            Demo request received
          </h2>
          <p className="mt-3 text-base leading-relaxed text-foreground/65">{state.message}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="px-8">
              <Link href="/for-salons/start?plan=pro">Start trial instead</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8">
              <Link href="/for-salons">Back to For Salons</Link>
            </Button>
          </div>
        </div>
        <aside className="hidden rounded-xl border border-border/60 bg-muted/25 p-6 lg:block">
          <p className="text-sm font-medium text-foreground/70">Prefer to self-serve?</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/55">
            You can also start a 30-day Pro trial now and explore the CRM at your own pace.
          </p>
        </aside>
      </div>
    )
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

        <div className="mt-6 rounded-xl border border-border/70 bg-card p-5 shadow-sm shadow-black/[0.03] sm:p-6">
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              startTransition(async () => {
                const result = await submitBookDemoAction(state, formData)
                setState(result)
                if (result.ok) {
                  trackEvent("Lead", {
                    content_name: "Book demo",
                    content_category: "for_salons",
                  })
                }
              })
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="ownerName">Your name</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  placeholder="e.g. Priya Sharma"
                  className="h-11 rounded-xl"
                  required
                />
                {state && !state.ok && state.fieldErrors?.ownerName ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.ownerName}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  placeholder="e.g. Bloom Salon"
                  className="h-11 rounded-xl"
                  required
                />
                {state && !state.ok && state.fieldErrors?.businessName ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.businessName}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="businessType">Business type</Label>
              <Select
                id="businessType"
                name="businessType"
                defaultValue=""
                placeholder="Select your business type"
                className={cn(
                  "h-11 rounded-xl border-input bg-background/60 px-4 shadow-sm shadow-black/[0.02]",
                  state &&
                    !state.ok &&
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
              {state && !state.ok && state.fieldErrors?.businessType ? (
                <p className="text-sm text-destructive">{state.fieldErrors.businessType}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="mobile">Mobile number</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  className="h-11 rounded-xl"
                  required
                />
                {state && !state.ok && state.fieldErrors?.mobile ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.mobile}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@business.com"
                  className="h-11 rounded-xl"
                  required
                />
                {state && !state.ok && state.fieldErrors?.email ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
                ) : null}
              </div>
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
              {state && !state.ok && state.fieldErrors?.city ? (
                <p className="text-sm text-destructive">{state.fieldErrors.city}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Business address</Label>
              <textarea
                id="address"
                name="address"
                rows={3}
                placeholder="Shop / floor, street, landmark"
                className="min-h-[5.5rem] w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm shadow-sm shadow-black/[0.02] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20"
                required
              />
              {state && !state.ok && state.fieldErrors?.address ? (
                <p className="text-sm text-destructive">{state.fieldErrors.address}</p>
              ) : null}
            </div>

            {state && !state.ok && state.message ? (
              <p className="text-sm text-destructive">{state.message}</p>
            ) : null}

            <Button type="submit" size="lg" className="mt-2 w-full sm:w-auto" disabled={pending}>
              {pending ? <Loader2Icon className="size-4 animate-spin" /> : null}
              Request demo
            </Button>
          </form>
        </div>
      </div>

      <aside className="space-y-4">
        {SIDEBAR_POINTS.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-border/60 bg-muted/20 p-5"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-foreground text-background">
              <Icon className="size-4" aria-hidden />
            </div>
            <h3 className="mt-4 font-heading text-base font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">{body}</p>
          </div>
        ))}
        <p className="px-1 text-xs leading-relaxed text-foreground/45">
          Already ready to join?{" "}
          <Link
            href="/for-salons/start?plan=pro"
            className="font-medium text-foreground/70 underline underline-offset-4 hover:text-foreground"
          >
            Start your 30-day Pro trial
          </Link>
          .
        </p>
      </aside>
    </div>
  )
}
