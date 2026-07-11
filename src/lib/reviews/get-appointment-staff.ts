import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function getAppointmentStaffNameForReview(
  appointmentId: string,
): Promise<string | undefined> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("appointments")
    .select("staff:staff(full_name)")
    .eq("id", appointmentId)
    .is("deleted_at", null)
    .maybeSingle()

  if (!data) return undefined

  const staff = Array.isArray(data.staff) ? data.staff[0] : data.staff
  const name = staff?.full_name?.trim()
  return name || undefined
}
