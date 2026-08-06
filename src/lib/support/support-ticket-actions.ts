"use server"

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

export type SupportTicketState =
  | { ok: true; message: string }
  | {
      ok: false
      message: string
      fieldErrors?: Partial<
        Record<"name" | "email" | "phone" | "salonName" | "bookingReference" | "message", string>
      >
    }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitSupportTicketAction(
  _prev: SupportTicketState | null,
  formData: FormData,
): Promise<SupportTicketState> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const phone = String(formData.get("phone") ?? "").trim()
  const salonName = String(formData.get("salonName") ?? "").trim()
  const bookingReference = String(formData.get("bookingReference") ?? "").trim()
  const message = String(formData.get("message") ?? "").trim()

  const fieldErrors: NonNullable<Extract<SupportTicketState, { ok: false }>["fieldErrors"]> = {}

  if (name.length < 2) fieldErrors.name = "Please enter your name."
  if (!email || !EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email."
  if (!bookingReference || bookingReference.length < 4) {
    fieldErrors.bookingReference = "Enter your booking ID from the confirmation."
  }
  if (message.length < 10) fieldErrors.message = "Please describe the issue (at least 10 characters)."
  if (phone && phone.replace(/\D/g, "").length < 10) {
    fieldErrors.phone = "Enter a valid 10-digit mobile number."
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please check the form.", fieldErrors }
  }

  const noteParts = [
    "Support ticket from Glammzo Help Center.",
    bookingReference ? `Booking reference: ${bookingReference}` : null,
    "",
    message,
  ].filter((part) => part !== null)

  if (!isSupabaseConfigured()) {
    console.info("[support] ticket (supabase not configured)", {
      name,
      email,
      phone,
      salonName,
      bookingReference,
      message,
    })
    return {
      ok: true,
      message: "Thanks — your ticket was received. We’ll reply by email soon.",
    }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("platform_leads").insert({
    salon_name: salonName || "Customer support",
    owner_name: name,
    email,
    phone: phone || null,
    city: null,
    area: null,
    source: "glamzzo_web_support",
    status: "new",
    notes: noteParts.join("\n"),
  })

  if (error) {
    console.error("[support] ticket insert failed:", error.message)
    return {
      ok: false,
      message: "We could not submit your ticket. Please try again or email hello@glammzo.com.",
    }
  }

  return {
    ok: true,
    message: "Thanks — your ticket was sent to our support team. We’ll reply by email soon.",
  }
}
