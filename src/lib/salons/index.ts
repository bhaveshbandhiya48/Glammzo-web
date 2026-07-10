import "server-only"

import { cache } from "react"

import { demoSalons } from "@/data/demo-salons"
import { fetchCrmSalonById, fetchCrmSalons } from "@/lib/salons/fetch-crm-salons"
import { isSupabaseConfigured } from "@/lib/supabase/admin"
import type { Salon } from "@/types/salon"

export const getSalons = cache(async (): Promise<Salon[]> => {
  if (!isSupabaseConfigured()) return demoSalons

  return fetchCrmSalons()
})

export type SalonLookupOptions = {
  preview?: boolean
}

export const getSalonById = cache(
  async (id: string, options: SalonLookupOptions = {}): Promise<Salon | undefined> => {
    if (isSupabaseConfigured()) {
      return (
        (await fetchCrmSalonById(id, { allowUnpublished: options.preview })) ?? undefined
      )
    }

    return demoSalons.find((s) => s.id === id)
  },
)

export async function getSalonsByCategory(category: string): Promise<Salon[]> {
  const salons = await getSalons()
  if (category === "all") return salons

  const needle = category.toLowerCase()
  return salons.filter((s) =>
    s.services.some(
      (svc) =>
        svc.category.toLowerCase().includes(needle) ||
        svc.name.toLowerCase().includes(needle)
    )
  )
}
