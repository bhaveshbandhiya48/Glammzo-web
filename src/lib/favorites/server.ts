import "server-only"

import { getSalons } from "@/lib/salons"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/admin"
import type { Salon } from "@/types/salon"

export async function getConsumerFavoriteSalonIds(phone: string): Promise<Set<string>> {
  if (!isSupabaseConfigured()) return new Set()

  const phoneDigits = normalizeCustomerPhoneDigits(phone)
  if (!phoneDigits) return new Set()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("consumer_favorite_salons")
    .select("salon_id")
    .eq("consumer_phone_normalized", phoneDigits)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[favorites] fetch failed:", error.message)
    return new Set()
  }

  return new Set((data ?? []).map((row) => (row as { salon_id: string }).salon_id))
}

export async function getConsumerFavoriteSalons(phone: string): Promise<Salon[]> {
  const favoriteIds = await getConsumerFavoriteSalonIds(phone)
  if (favoriteIds.size === 0) return []

  const salons = await getSalons()
  return salons.filter((salon) => salon.crmSalonId && favoriteIds.has(salon.crmSalonId))
}

export async function isSalonFavorited(phone: string, crmSalonId: string): Promise<boolean> {
  const favorites = await getConsumerFavoriteSalonIds(phone)
  return favorites.has(crmSalonId)
}
