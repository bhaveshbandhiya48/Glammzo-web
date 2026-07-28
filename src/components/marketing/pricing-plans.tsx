"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CheckIcon } from "lucide-react"

import type { PlatformOfferView, PublicPlanView } from "@/lib/subscriptions/plan-catalog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PricingPlansProps = {
  plans: PublicPlanView[]
  offer: PlatformOfferView | null
}

export function PricingPlans({ plans, offer }: PricingPlansProps) {
  const [interval, setInterval] = useState<"month" | "year">("month")

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => a.sortOrder - b.sortOrder),
    [plans],
  )

  return (
    <div>
      {offer ? (
        <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4 text-center">
          <p className="text-sm font-semibold text-primary">{offer.title}</p>
          <p className="mt-1 text-sm text-foreground/65">{offer.subtitle}</p>
          {offer.bannerCopy ? (
            <p className="mt-2 text-xs text-foreground/50">{offer.bannerCopy}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mb-8 flex justify-center">
        <div
          role="group"
          aria-label="Billing interval"
          className="inline-flex rounded-full border border-border/70 bg-card/90 p-1 shadow-sm shadow-black/[0.03]"
        >
          {(["month", "year"] as const).map((value) => {
            const active = interval === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setInterval(value)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  active
                    ? "bg-foreground text-background"
                    : "text-foreground/60 hover:text-foreground",
                )}
              >
                {value === "month" ? "Monthly" : "Yearly"}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {sortedPlans.map((plan) => {
          const monthly = plan.prices.find((p) => p.interval === "month")
          const yearly = plan.prices.find((p) => p.interval === "year")
          const selectedPrice =
            interval === "year" && yearly && yearly.amountPaise > 0 ? yearly : monthly
          const featured = plan.highlight === "most_popular" || plan.code === "pro"
          const enabledFeatures = plan.features.filter((f) => f.enabled)
          const ctaHref = `/for-salons/start?plan=${plan.code}`
          const ctaLabel =
            plan.code === "starter"
              ? "Start free"
              : plan.code === "pro" && offer
                ? "Start Pro trial"
                : "Get started"

          return (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm shadow-black/[0.03]",
                featured
                  ? "border-primary/40 ring-1 ring-primary/20"
                  : "border-border/65",
              )}
            >
              {featured ? (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[0.65rem] font-semibold tracking-wide text-primary-foreground uppercase">
                  Most popular
                </span>
              ) : null}

              <h2 className="font-heading text-xl font-semibold tracking-tight">{plan.name}</h2>
              {plan.tagline ? (
                <p className="mt-1 text-sm text-foreground/55">{plan.tagline}</p>
              ) : null}

              <p className="mt-5 font-heading text-4xl font-semibold tracking-tight">
                {selectedPrice?.formatted ?? "₹0"}
                <span className="text-base font-normal text-foreground/45">
                  /{interval === "year" && yearly && yearly.amountPaise > 0 ? "yr" : "mo"}
                </span>
              </p>

              {plan.neverExpires || (monthly && monthly.amountPaise === 0) ? (
                <p className="mt-1 text-sm text-foreground/50">Free forever</p>
              ) : interval === "month" && yearly && yearly.amountPaise > 0 ? (
                <p className="mt-1 text-sm text-foreground/50">or {yearly.formatted}/year</p>
              ) : interval === "year" && monthly ? (
                <p className="mt-1 text-sm text-foreground/50">{monthly.formatted}/month billed yearly</p>
              ) : (
                <p className="mt-1 text-sm text-foreground/50">&nbsp;</p>
              )}

              <p className="mt-4 text-sm leading-relaxed text-foreground/60">{plan.description}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {enabledFeatures.map((feature) => (
                  <li key={feature.key} className="flex gap-2.5 text-sm text-foreground/75">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span>
                      {feature.name}
                      {feature.limitValue
                        ? ` (${feature.limitValue.toLocaleString("en-IN")}/mo)`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                variant={featured ? "default" : "outline"}
                className="mt-8 w-full rounded-full"
              >
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
            </article>
          )
        })}
      </div>

      <p className="mt-8 text-center text-sm text-foreground/50">
        Online checkout is coming soon. Choose a plan to create your salon account and finish
        your business profile in CRM.
      </p>
    </div>
  )
}
