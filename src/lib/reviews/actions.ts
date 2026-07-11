"use server"

import { redirect } from "next/navigation"

import { createAdminClient } from "@/lib/supabase/admin"
import { getSession } from "@/lib/auth/session"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { SALON_REVIEW_TYPES, type SalonReviewType } from "@/lib/reviews/review-types"

export async function createSalonReviewAction(formData: FormData) {
  const session = await getSession()
  if (!session?.phone) {
    redirect(`/login?next=/dashboard/bookings`)
  }

  const appointmentId = String(formData.get("appointmentId") ?? "").trim()
  const ratingRaw = formData.get("rating")
  const reviewTypeRaw = String(formData.get("reviewType") ?? "").trim()
  const comment = String(formData.get("comment") ?? "").trim()
  const includeStaffReview = formData.get("includeStaffReview") === "1"

  const rating = Number(ratingRaw)
  const reviewType = SALON_REVIEW_TYPES.includes(reviewTypeRaw as SalonReviewType)
    ? (reviewTypeRaw as SalonReviewType)
    : null

  if (
    !appointmentId ||
    !Number.isFinite(rating) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    !reviewType ||
    comment.length < 3 ||
    comment.length > 2000
  ) {
    redirect(`/dashboard/bookings?error=review`)
  }

  const supabase = createAdminClient()

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, salon_id, customer_id, staff_id, service_id, status")
    .eq("id", appointmentId)
    .is("deleted_at", null)
    .maybeSingle()

  if (!appointment) {
    redirect(`/dashboard/bookings?error=review`)
  }

  if (appointment.status !== "completed") {
    redirect(`/dashboard/bookings?error=review`)
  }

  const phoneDigits = normalizeCustomerPhoneDigits(session.phone)
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("salon_id", appointment.salon_id)
    .eq("phone_normalized", phoneDigits)
    .is("deleted_at", null)
    .maybeSingle()

  if (!customer || customer.id !== appointment.customer_id) {
    redirect(`/dashboard/bookings?error=review`)
  }

  // Prevent duplicates: appointment_id is unique for non-null values.
  const { data: existing } = await supabase
    .from("salon_reviews")
    .select("id")
    .eq("appointment_id", appointmentId)
    .maybeSingle()

  if (existing) {
    redirect(`/dashboard/bookings`)
  }

  const { error } = await supabase.from("salon_reviews").insert({
    salon_id: appointment.salon_id,
    appointment_id: appointmentId,
    customer_id: appointment.customer_id,
    staff_id: includeStaffReview ? appointment.staff_id : null,
    service_id: appointment.service_id,
    rating,
    review_type: reviewType,
    comment,
    verified: true,
  })

  if (error) {
    redirect(`/dashboard/bookings?error=review`)
  }

  redirect(`/dashboard/bookings`)
}

