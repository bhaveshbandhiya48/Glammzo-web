"use server"

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"
import { buildCrmSignupUrl } from "@/lib/crm/glamzzo-crm-url"

export type PartnerSignupState =
  | { ok: true; crmSignupUrl: string }
  | {
      ok: false
      message: string
      fieldErrors?: Partial<Record<string, string>>
    }

export async function partnerSignupAction(
  _prev: PartnerSignupState | { ok: false; message: string },
  formData: FormData,
): Promise<PartnerSignupState> {
  const salonName = String(formData.get("salonName") ?? "").trim()
  const contactName = String(formData.get("contactName") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const city = String(formData.get("city") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()

  const fieldErrors: Record<string, string> = {}
  if (!salonName) fieldErrors.salonName = "Salon name is required."
  if (!contactName) fieldErrors.contactName = "Contact name is required."
  if (!email) fieldErrors.email = "Email is required."
  if (!city) fieldErrors.city = "City is required."

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please check the form.", fieldErrors }
  }

  const crmSignupUrl = buildCrmSignupUrl(email)

  if (!isSupabaseConfigured()) {
    return { ok: true, crmSignupUrl }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("platform_leads").insert({
    salon_name: salonName,
    owner_name: contactName,
    email,
    phone: phone || null,
    city,
    source: "glamzzo_web_partner",
    status: "new",
    notes: "Submitted via Glammzo-web partner signup.",
  })

  if (error) {
    console.error("[partner] lead insert failed:", error.message)
    return {
      ok: false,
      message: "We could not save your request. Please try again or email support.",
    }
  }

  return { ok: true, crmSignupUrl }
}
