import "server-only"

import { randomBytes, randomUUID } from "node:crypto"

import { buildCrmOnboardingDestination, getGlamzzoCrmUrl } from "@/lib/crm/glamzzo-crm-url"
import { normalizeCustomerPhone } from "@/lib/phone/normalize"
import {
  buildPhoneSignupEmail,
  type SalonOnboardingProgress,
} from "@/lib/salon-onboarding/constants"
import { findIndianStateForCity } from "@/lib/salon-onboarding/india"
import { slugifySalonName, withUniqueSlugSuffix } from "@/lib/salon-onboarding/slug"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

export type ProvisionResult =
  | { ok: true; salonId: string; handoffUrl: string; authEmail: string }
  | { ok: false; error: string }

/**
 * Mirrors glamzzo-crm `completeSalonSignup`:
 * auth user (phone.glamzzo.local) + salon draft + owner membership → CRM magic link.
 */
export async function provisionSalonWorkspace(
  progress: SalonOnboardingProgress,
): Promise<ProvisionResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Salon setup is not configured on this server. Please contact support.",
    }
  }

  const admin = createAdminClient()
  const mobileE164 = normalizeCustomerPhone(progress.mobile)
  const authEmail = buildPhoneSignupEmail(progress.mobile)
  const tempPassword = randomBytes(24).toString("base64url")
  const state = findIndianStateForCity(progress.city) || "Karnataka"
  let userId: string | null = null
  let salonId: string | null = null

  try {
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: authEmail,
      password: tempPassword,
      email_confirm: true,
      phone: mobileE164,
      phone_confirm: true,
      user_metadata: {
        full_name: progress.ownerName,
        signup_flow: "marketplace_web",
      },
    })

    if (authError || !authData.user) {
      return {
        ok: false,
        error: authError?.message ?? "Failed to create your account.",
      }
    }

    userId = authData.user.id

    let slug = slugifySalonName(progress.businessName)
    if (!slug) slug = withUniqueSlugSuffix("salon")

    const now = new Date().toISOString()
    salonId = randomUUID()

    const settings = {
      businessType: progress.businessType,
      marketplace: {
        status: "draft",
        submittedAt: null,
        approvedAt: null,
      },
      branding: {
        primaryColor: "#f95c48",
        secondaryColor: "#e4ded2",
        logoStoragePath: null,
        listImageStoragePath: null,
        coverImageStoragePath: null,
        useDefaultBranding: false,
      },
      onboarding: {
        completedAt: now,
        version: 2,
        signupFlow: "marketplace_web",
        source: "glammzo_web_for_salons",
      },
    }

    const salonPayload = {
      id: salonId,
      name: progress.businessName,
      slug,
      email: authEmail,
      phone: mobileE164,
      address_line1: progress.city,
      address_line2: null,
      city: progress.city,
      state,
      country: "IN",
      postal_code: "000000",
      latitude: null,
      longitude: null,
      logo_url: null,
      list_image_url: null,
      cover_image_url: null,
      listing_status: "draft" as const,
      settings,
      is_active: true,
      status: "active" as const,
    }

    let { error: salonError } = await admin.from("salons").insert(salonPayload as never)

    if (salonError?.code === "23505") {
      const uniqueSlug = withUniqueSlugSuffix(slug)
      ;({ error: salonError } = await admin.from("salons").insert({
        ...salonPayload,
        slug: uniqueSlug,
      } as never))
    }

    if (salonError) {
      throw new Error(salonError.message ?? "Failed to create salon workspace.")
    }

    const { error: membershipError } = await admin.from("user_salons").insert({
      user_id: userId,
      salon_id: salonId,
      role: "owner",
      is_active: true,
      joined_at: now,
    } as never)

    if (membershipError) {
      throw new Error(membershipError.message ?? "Failed to assign owner access.")
    }

    const { error: profileError } = await admin.from("users").upsert(
      {
        id: userId,
        email: authEmail,
        full_name: progress.ownerName,
        phone: mobileE164,
        is_active: true,
        onboarding_completed_at: now,
      } as never,
      { onConflict: "id" },
    )

    if (profileError) {
      throw new Error(profileError.message ?? "Failed to save owner profile.")
    }

    const { error: progressError } = await admin.from("onboarding_progress").upsert(
      {
        salon_id: salonId,
        service_completed: false,
        staff_completed: false,
        customer_completed: false,
        appointment_completed: false,
        services_setup_completed: true,
        dismissed: false,
        snoozed_until: null,
        celebration_seen_at: null,
        completed_at: null,
        updated_at: now,
      } as never,
      { onConflict: "salon_id" },
    )

    if (progressError) {
      console.error("[provision] onboarding_progress:", progressError.message)
    }

    const redirectTo = buildCrmOnboardingDestination()
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: authEmail,
      options: { redirectTo },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[provision] generateLink failed:", linkError?.message)
      return {
        ok: true,
        salonId,
        authEmail,
        handoffUrl: `${getGlamzzoCrmUrl()}/login`,
      }
    }

    return {
      ok: true,
      salonId,
      authEmail,
      handoffUrl: linkData.properties.action_link,
    }
  } catch (error) {
    console.error("[provision] failed:", error)

    if (salonId) {
      try {
        await admin.from("user_salons").delete().eq("salon_id", salonId)
        await admin.from("onboarding_progress").delete().eq("salon_id", salonId)
        await admin.from("salons").delete().eq("id", salonId)
      } catch (cleanupError) {
        console.error("[provision] salon cleanup:", cleanupError)
      }
    }

    if (userId) {
      try {
        await admin.auth.admin.deleteUser(userId)
      } catch (cleanupError) {
        console.error("[provision] user cleanup:", cleanupError)
      }
    }

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to create your salon workspace. Please try again.",
    }
  }
}

export async function lookupOwnerByMobile(mobile: string) {
  if (!isSupabaseConfigured()) return false

  const admin = createAdminClient()
  const mobileE164 = normalizeCustomerPhone(mobile)
  const authEmail = buildPhoneSignupEmail(mobile)

  const { data: byPhone } = await admin
    .from("users")
    .select("id")
    .eq("phone", mobileE164)
    .maybeSingle()

  if (byPhone?.id) return true

  let page = 1
  while (page <= 5) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error || !data?.users?.length) return false
    if (
      data.users.some(
        (u) =>
          u.email?.toLowerCase() === authEmail ||
          (u.phone ?? "").replace(/\D/g, "").slice(-10) === mobileE164.slice(-10),
      )
    ) {
      return true
    }
    if (data.users.length < 200) return false
    page += 1
  }

  return false
}
