import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { isCrmAppointmentEligibleForReview } from "@/lib/bookings/booking-status"
import { SALON_REVIEW_TYPES, type SalonReviewType } from "@/lib/reviews/review-types"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) {
      return jsonError(401, "Sign in required.")
    }
    if (!isSupabaseConfigured()) {
      return jsonError(503, "Reviews are not available right now.")
    }

    const body = (await request.json().catch(() => null)) as {
      appointmentId?: unknown
      rating?: unknown
      reviewType?: unknown
      comment?: unknown
      includeStaffReview?: unknown
    } | null

    const appointmentId =
      typeof body?.appointmentId === "string" ? body.appointmentId.trim() : ""
    const rating = Number(body?.rating)
    const reviewTypeRaw =
      typeof body?.reviewType === "string" ? body.reviewType.trim() : ""
    const comment = typeof body?.comment === "string" ? body.comment.trim() : ""
    const includeStaffReview = Boolean(body?.includeStaffReview)

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
      return jsonError(400, "Invalid review. Rating 1–5 and a short comment are required.")
    }

    const supabase = createAdminClient()
    const { data: appointment } = await supabase
      .from("appointments")
      .select("id, salon_id, customer_id, staff_id, service_id, status, appointment_date")
      .eq("id", appointmentId)
      .is("deleted_at", null)
      .maybeSingle()

    if (!appointment) {
      return jsonError(404, "Booking not found.")
    }
    if (
      !isCrmAppointmentEligibleForReview({
        status: appointment.status,
        appointmentDate: appointment.appointment_date,
      })
    ) {
      return jsonError(400, "You can only review completed visits.")
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
      return jsonError(403, "This booking does not belong to your account.")
    }

    const { data: existing } = await supabase
      .from("salon_reviews")
      .select("id")
      .eq("appointment_id", appointmentId)
      .maybeSingle()

    if (existing) {
      return jsonOk({ alreadyReviewed: true })
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
      console.error("[mobile/reviews POST]", error)
      return jsonError(500, "Could not save review.")
    }

    return jsonOk({ submitted: true })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/reviews POST]", error)
    return jsonError(500, "Could not submit review.")
  }
}
