"use server"

import { getSession } from "@/lib/auth/session"
import { createInvoiceShareToken, isInvoiceShareConfigured } from "@/lib/bookings/invoice-share-token"
import { getGlamzzoCrmUrl } from "@/lib/crm/glamzzo-crm-url"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

export type BookingInvoicePdfResult =
  | { ok: true; pdfUrl: string; fileName: string }
  | { ok: false; message: string }

/**
 * Returns a time-limited CRM PDF share URL for a completed booking the customer owns.
 */
export async function getBookingInvoicePdfUrlAction(
  appointmentId: string,
): Promise<BookingInvoicePdfResult> {
  const id = appointmentId.trim()
  if (!id) {
    return { ok: false, message: "Missing booking reference." }
  }

  const session = await getSession()
  if (!session?.phone) {
    return { ok: false, message: "Please sign in to download your invoice." }
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Invoice download is not available right now." }
  }

  if (!isInvoiceShareConfigured()) {
    return {
      ok: false,
      message: "Invoice download is not configured. Please contact support.",
    }
  }

  const supabase = createAdminClient()

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, salon_id, customer_id, status, appointment_date")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle()

  if (!appointment) {
    return { ok: false, message: "Booking not found." }
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
    return { ok: false, message: "You do not have access to this invoice." }
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, invoice_number")
    .eq("appointment_id", appointment.id)
    .eq("salon_id", appointment.salon_id)
    .is("deleted_at", null)
    .maybeSingle()

  if (!invoice) {
    const crmCompleted = appointment.status === "completed"
    return {
      ok: false,
      message: crmCompleted
        ? "No invoice is ready yet. It is created when the salon finishes billing for your visit."
        : "No invoice yet. The salon still needs to complete this visit and generate the bill in CRM.",
    }
  }

  const token = createInvoiceShareToken(invoice.id, appointment.salon_id)
  if (!token) {
    return { ok: false, message: "Could not prepare the invoice link. Please try again." }
  }

  const safeNumber = String(invoice.invoice_number ?? "invoice")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)

  return {
    ok: true,
    pdfUrl: `${getGlamzzoCrmUrl()}/api/invoices/share/${token}/pdf`,
    fileName: `invoice-${safeNumber || "download"}.pdf`,
  }
}
