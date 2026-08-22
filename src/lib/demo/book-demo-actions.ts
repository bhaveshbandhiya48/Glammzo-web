"use server"

import { BUSINESS_TYPES } from "@/lib/salon-onboarding/constants"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type BookDemoState =
  | { ok: true; message: string }
  | {
      ok: false
      message: string
      fieldErrors?: Partial<
        Record<
          | "ownerName"
          | "businessName"
          | "businessType"
          | "mobile"
          | "email"
          | "city"
          | "address",
          string
        >
      >
    }

function normalizeMobile(raw: string) {
  return raw.replace(/\D/g, "").slice(-10)
}

export async function submitBookDemoAction(
  _prev: BookDemoState | null,
  formData: FormData,
): Promise<BookDemoState> {
  const ownerName = String(formData.get("ownerName") ?? "").trim()
  const businessName = String(formData.get("businessName") ?? "").trim()
  const businessType = String(formData.get("businessType") ?? "").trim()
  const mobileRaw = String(formData.get("mobile") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const city = String(formData.get("city") ?? "").trim()
  const address = String(formData.get("address") ?? "").trim()
  const mobile = normalizeMobile(mobileRaw)

  const fieldErrors: NonNullable<Extract<BookDemoState, { ok: false }>["fieldErrors"]> = {}

  if (ownerName.length < 2) fieldErrors.ownerName = "Please enter your name."
  if (businessName.length < 2) fieldErrors.businessName = "Please enter your business name."
  if (!BUSINESS_TYPES.includes(businessType as (typeof BUSINESS_TYPES)[number])) {
    fieldErrors.businessType = "Select a business type."
  }
  if (mobile.length !== 10) fieldErrors.mobile = "Enter a valid 10-digit mobile number."
  if (!email || !EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email."
  if (city.length < 2) fieldErrors.city = "Please enter your city."
  if (address.length < 5) fieldErrors.address = "Please enter your business address."

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please check the form.", fieldErrors }
  }

  const notes = [
    "Book demo request from /book-demo",
    `Business type: ${businessType}`,
    `Address: ${address}`,
  ].join("\n")

  if (!isSupabaseConfigured()) {
    console.info("[book-demo] lead (supabase not configured)", {
      ownerName,
      businessName,
      businessType,
      mobile,
      email,
      city,
      address,
    })
    return {
      ok: true,
      message: "Thanks — we received your request. Our team will call you shortly to schedule a demo.",
    }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("platform_leads").insert({
    salon_name: businessName,
    owner_name: ownerName,
    email,
    phone: mobile,
    city,
    area: address.slice(0, 120),
    source: "website_demo",
    status: "new",
    notes,
  })

  if (error) {
    console.error("[book-demo] lead insert failed:", error.message)
    return {
      ok: false,
      message: "We could not submit your request. Please try again or email support@glammzo.com.",
    }
  }

  return {
    ok: true,
    message: "Thanks — we received your request. Our team will call you shortly to schedule a demo.",
  }
}
