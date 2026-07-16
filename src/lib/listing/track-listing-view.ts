import "server-only"

import { createHash } from "node:crypto"
import { headers } from "next/headers"

import { createAdminClient } from "@/lib/supabase/admin"

const VIEW_SOURCE = "glamzzo_web"

/** In-process guard for Next.js Strict Mode / duplicate renders in the same instance. */
const recentClaims = new Map<string, number>()
const CLAIM_TTL_MS = 60_000

function startOfWeek(date = new Date()) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function startOfWeekIso(date = new Date()) {
  return startOfWeek(date).toISOString()
}

function weekBucketKey(date = new Date()) {
  const start = startOfWeek(date)
  const year = start.getFullYear()
  const month = String(start.getMonth() + 1).padStart(2, "0")
  const day = String(start.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function hashVisitor(ip: string) {
  const salt = process.env.AUTH_SECRET ?? "glamzzo-listing-view"
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32)
}

function claimLocal(key: string) {
  const now = Date.now()
  for (const [entry, at] of recentClaims) {
    if (now - at > CLAIM_TTL_MS) recentClaims.delete(entry)
  }
  const previous = recentClaims.get(key)
  if (previous && now - previous < CLAIM_TTL_MS) {
    return false
  }
  recentClaims.set(key, now)
  return true
}

function isMissingVisitorSchema(message: string | undefined) {
  if (!message) return false
  const normalized = message.toLowerCase()
  return (
    (normalized.includes("visitor_key") || normalized.includes("week_bucket")) &&
    (normalized.includes("column") || normalized.includes("schema cache"))
  )
}

export async function getRequestVisitorKey() {
  const headerStore = await headers()
  const forwarded = headerStore.get("x-forwarded-for")
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip")?.trim() ||
    headerStore.get("cf-connecting-ip")?.trim() ||
    "unknown"
  return hashVisitor(ip)
}

/**
 * Records at most one listing view per visitor IP per salon per week.
 * Prefers visitor_key + week_bucket; falls back to embedding the key in `source`
 * until migration 071 is applied.
 */
export async function trackListingView(crmSalonId: string, visitorKey?: string) {
  const key = visitorKey ?? (await getRequestVisitorKey())
  const weekBucket = weekBucketKey()
  const claimKey = `${crmSalonId}:${key}:${weekBucket}`
  if (!claimLocal(claimKey)) {
    return
  }

  const supabase = createAdminClient()
  const weekStart = startOfWeekIso()
  const legacySource = `${VIEW_SOURCE}:${key}`

  const existingByKey = await supabase
    .from("listing_views")
    .select("id")
    .eq("salon_id", crmSalonId)
    .eq("visitor_key", key)
    .eq("week_bucket", weekBucket)
    .limit(1)
    .maybeSingle()

  if (!existingByKey.error && existingByKey.data) {
    return
  }

  if (isMissingVisitorSchema(existingByKey.error?.message)) {
    const existingLegacy = await supabase
      .from("listing_views")
      .select("id")
      .eq("salon_id", crmSalonId)
      .eq("source", legacySource)
      .gte("viewed_at", weekStart)
      .limit(1)
      .maybeSingle()

    if (existingLegacy.data) {
      return
    }

    const { error } = await supabase.from("listing_views").insert({
      salon_id: crmSalonId,
      source: legacySource,
    })

    if (error) {
      console.error("[listing] view tracking failed:", error.message)
    }
    return
  }

  if (existingByKey.error) {
    console.error("[listing] view lookup failed:", existingByKey.error.message)
  }

  const { error } = await supabase.from("listing_views").insert({
    salon_id: crmSalonId,
    source: VIEW_SOURCE,
    visitor_key: key,
    week_bucket: weekBucket,
  })

  if (error) {
    if (error.code === "23505" || error.message.toLowerCase().includes("duplicate")) {
      return
    }
    if (isMissingVisitorSchema(error.message)) {
      const existingLegacy = await supabase
        .from("listing_views")
        .select("id")
        .eq("salon_id", crmSalonId)
        .eq("source", legacySource)
        .gte("viewed_at", weekStart)
        .limit(1)
        .maybeSingle()

      if (existingLegacy.data) {
        return
      }

      const legacyInsert = await supabase.from("listing_views").insert({
        salon_id: crmSalonId,
        source: legacySource,
      })
      if (legacyInsert.error) {
        console.error("[listing] view tracking failed:", legacyInsert.error.message)
      }
      return
    }
    console.error("[listing] view tracking failed:", error.message)
  }
}
