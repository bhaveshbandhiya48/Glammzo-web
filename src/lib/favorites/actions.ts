"use server"

import { revalidatePath } from "next/cache"

import { getSession } from "@/lib/auth/session"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/admin"

export type FavoriteToggleResult =
  | { success: true; favorited: boolean }
  | { success: false; error: string }

export async function toggleFavoriteSalonAction(
  crmSalonId: string,
): Promise<FavoriteToggleResult> {
  const session = await getSession()
  if (!session?.phone) {
    return { success: false, error: "Sign in to save favorites." }
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Favorites are not available in demo mode." }
  }

  const salonId = crmSalonId.trim()
  if (!salonId) {
    return { success: false, error: "Invalid salon." }
  }

  const phoneDigits = normalizeCustomerPhoneDigits(session.phone)
  if (!phoneDigits) {
    return { success: false, error: "Invalid phone number on your account." }
  }

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from("consumer_favorite_salons")
    .select("id")
    .eq("consumer_phone_normalized", phoneDigits)
    .eq("salon_id", salonId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("consumer_favorite_salons")
      .delete()
      .eq("id", (existing as { id: string }).id)

    if (error) {
      return { success: false, error: "Could not remove favorite." }
    }

    revalidatePath("/explore")
    revalidatePath("/dashboard/favorites")
    revalidatePath("/salons", "layout")

    return { success: true, favorited: false }
  }

  const { error } = await supabase.from("consumer_favorite_salons").insert({
    consumer_phone_normalized: phoneDigits,
    salon_id: salonId,
  })

  if (error) {
    return { success: false, error: "Could not save favorite." }
  }

  revalidatePath("/explore")
  revalidatePath("/dashboard/favorites")
  revalidatePath("/salons", "layout")

  return { success: true, favorited: true }
}
