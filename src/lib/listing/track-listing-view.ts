import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function trackListingView(crmSalonId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("listing_views").insert({
    salon_id: crmSalonId,
    source: "glamzzo_web",
  })

  if (error) {
    console.error("[listing] view tracking failed:", error.message)
  }
}
