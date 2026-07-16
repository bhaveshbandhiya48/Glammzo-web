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

  const normalizeCategory = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

  const needle = normalizeCategory(category)
  return salons.filter((s) =>
    s.services.some((svc) => normalizeCategory(svc.category) === needle)
  )
}
