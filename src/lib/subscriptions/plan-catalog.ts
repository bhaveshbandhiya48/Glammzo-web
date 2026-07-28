import "server-only"

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

export type SalonPlanCode = "starter" | "growth" | "pro"

export type PlanPriceView = {
  interval: "month" | "year"
  amountPaise: number
  currency: string
  formatted: string
}

export type PlanFeatureView = {
  key: string
  name: string
  description: string
  enabled: boolean
  limitValue: number | null
}

export type PublicPlanView = {
  id: string
  code: SalonPlanCode
  name: string
  tagline: string
  description: string
  sortOrder: number
  highlight: "most_popular" | null
  neverExpires: boolean
  prices: PlanPriceView[]
  features: PlanFeatureView[]
}

export type PlatformOfferView = {
  id: string
  code: string
  title: string
  subtitle: string
  bannerCopy: string
  grantsPlanCode: SalonPlanCode
  trialDays: number
}

type PlanRow = {
  id: string
  code: string
  name: string
  tagline: string | null
  description: string | null
  sort_order: number
  highlight: "most_popular" | null
  never_expires: boolean
}

type PriceRow = {
  plan_id: string
  interval: "month" | "year"
  amount_paise: number
  currency: string
}

type FeatureJoinRow = {
  plan_id: string
  enabled: boolean
  limit_value: number | null
  subscription_features:
    | {
        key: string
        name: string
        description: string | null
        display_order: number | null
      }
    | {
        key: string
        name: string
        description: string | null
        display_order: number | null
      }[]
    | null
}

export function formatInrFromPaise(amountPaise: number) {
  if (amountPaise <= 0) return "₹0"
  const rupees = amountPaise / 100
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees)
}

export function isSalonPlanCode(value: string | undefined | null): value is SalonPlanCode {
  return value === "starter" || value === "growth" || value === "pro"
}

function normalizePlanCode(code: string): SalonPlanCode | null {
  return isSalonPlanCode(code) ? code : null
}

function fallbackCatalog(): PublicPlanView[] {
  return [
    {
      id: "fallback-starter",
      code: "starter",
      name: "Free",
      tagline: "CRM only.",
      description: "Unlimited CRM to run your salon operations.",
      sortOrder: 1,
      highlight: null,
      neverExpires: true,
      prices: [{ interval: "month", amountPaise: 0, currency: "INR", formatted: "₹0" }],
      features: [
        {
          key: "crm_core",
          name: "Unlimited CRM",
          description: "Manage appointments, clients, and staff.",
          enabled: true,
          limitValue: null,
        },
      ],
    },
    {
      id: "fallback-growth",
      code: "growth",
      name: "Growth",
      tagline: "Get discovered.",
      description: "Marketplace listing plus booking confirmations, reminders, and reviews.",
      sortOrder: 2,
      highlight: null,
      neverExpires: false,
      prices: [
        { interval: "month", amountPaise: 55500, currency: "INR", formatted: "₹555" },
        { interval: "year", amountPaise: 555000, currency: "INR", formatted: "₹5,550" },
      ],
      features: [
        {
          key: "marketplace_listing",
          name: "Public Marketplace Listing",
          description: "Appear in Explore and search.",
          enabled: true,
          limitValue: null,
        },
        {
          key: "whatsapp_utility",
          name: "Utility WhatsApp Messages",
          description: "Confirmations and reminders.",
          enabled: true,
          limitValue: null,
        },
      ],
    },
    {
      id: "fallback-pro",
      code: "pro",
      name: "Pro",
      tagline: "Grow faster.",
      description: "Everything in Growth, plus full WhatsApp automation.",
      sortOrder: 3,
      highlight: "most_popular",
      neverExpires: false,
      prices: [
        { interval: "month", amountPaise: 99900, currency: "INR", formatted: "₹999" },
        { interval: "year", amountPaise: 999900, currency: "INR", formatted: "₹9,999" },
      ],
      features: [
        {
          key: "whatsapp_automation",
          name: "WhatsApp Automation",
          description: "Automated follow-ups and campaigns.",
          enabled: true,
          limitValue: 2500,
        },
      ],
    },
  ]
}

/** Same source of truth as glamzzo-crm public pricing. */
export async function loadPublicPlanCatalog(): Promise<PublicPlanView[]> {
  if (!isSupabaseConfigured()) return fallbackCatalog()

  try {
    const supabase = createAdminClient()

    const { data: plansData, error: plansError } = await supabase
      .from("subscription_plans")
      .select("id, code, name, tagline, description, sort_order, highlight, never_expires")
      .eq("is_active", true)
      .eq("is_public", true)
      .order("sort_order", { ascending: true })

    if (plansError || !plansData?.length) {
      console.error("[plan-catalog] plans fetch failed:", plansError?.message)
      return fallbackCatalog()
    }

    const plans = (plansData as PlanRow[])
      .map((plan) => {
        const code = normalizePlanCode(plan.code)
        if (!code) return null
        return { ...plan, code }
      })
      .filter((plan): plan is PlanRow & { code: SalonPlanCode } => Boolean(plan))

    if (plans.length === 0) return fallbackCatalog()

    const planIds = plans.map((p) => p.id)

    const [{ data: pricesData }, { data: featuresData }] = await Promise.all([
      supabase
        .from("subscription_plan_prices")
        .select("plan_id, interval, amount_paise, currency")
        .in("plan_id", planIds)
        .eq("is_active", true),
      supabase
        .from("subscription_plan_features")
        .select(
          "plan_id, enabled, limit_value, subscription_features(key, name, description, display_order)",
        )
        .in("plan_id", planIds),
    ])

    const prices = (pricesData ?? []) as PriceRow[]
    const featureRows = (featuresData ?? []) as FeatureJoinRow[]

    return plans.map((plan) => ({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      tagline: plan.tagline ?? "",
      description: plan.description ?? "",
      sortOrder: plan.sort_order,
      highlight: plan.highlight,
      neverExpires: plan.never_expires,
      prices: prices
        .filter((price) => price.plan_id === plan.id)
        .map((price) => ({
          interval: price.interval,
          amountPaise: price.amount_paise,
          currency: price.currency,
          formatted: formatInrFromPaise(price.amount_paise),
        })),
      features: featureRows
        .filter((row) => row.plan_id === plan.id)
        .map((row) => {
          const feature = Array.isArray(row.subscription_features)
            ? row.subscription_features[0]
            : row.subscription_features
          return {
            key: feature?.key ?? "",
            name: feature?.name ?? "",
            description: feature?.description ?? "",
            enabled: row.enabled,
            limitValue: row.limit_value,
          }
        })
        .filter((f) => f.key && f.enabled)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
  } catch (error) {
    console.error("[plan-catalog] unexpected error:", error)
    return fallbackCatalog()
  }
}

export async function loadActiveLaunchOffer(): Promise<PlatformOfferView | null> {
  if (!isSupabaseConfigured()) return null

  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("platform_offers")
      .select(
        "id, code, title, subtitle, banner_copy, grants_plan_code, trial_days, starts_at, ends_at",
      )
      .eq("is_active", true)
      .eq("code", "early_partner_pro_trial")
      .maybeSingle()

    if (error || !data) return null

    const offer = data as {
      id: string
      code: string
      title: string
      subtitle: string
      banner_copy: string
      grants_plan_code: string
      trial_days: number
      starts_at: string | null
      ends_at: string | null
    }

    if (offer.starts_at && offer.starts_at > now) return null
    if (offer.ends_at && offer.ends_at < now) return null

    const grantsPlanCode = normalizePlanCode(offer.grants_plan_code)
    if (!grantsPlanCode) return null

    return {
      id: offer.id,
      code: offer.code,
      title: offer.title,
      subtitle: offer.subtitle,
      bannerCopy: offer.banner_copy,
      grantsPlanCode,
      trialDays: offer.trial_days,
    }
  } catch (error) {
    console.error("[plan-catalog] offer fetch failed:", error)
    return null
  }
}
