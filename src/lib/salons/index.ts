import "server-only"

import { cache } from "react"

import { getSession } from "@/lib/auth/session"
import { businessTypeSlugFromLabel } from "@/lib/categories/business-types"
import { demoSalons } from "@/data/demo-salons"
import {
  canViewerSeeDemoSalons,
  filterDemoSalonsForViewer,
  isRestrictedDemoSalon,
} from "@/lib/salons/demo-salon-access"
import { fetchCrmSalonById, fetchCrmSalons } from "@/lib/salons/fetch-crm-salons"
import { isSupabaseConfigured } from "@/lib/supabase/admin"
import type { Salon } from "@/types/salon"

export const getSalons = cache(async (): Promise<Salon[]> => {
  const session = await getSession()
  const phone = session?.phone

  if (!isSupabaseConfigured()) {
    return filterDemoSalonsForViewer(demoSalons, phone)
  }

  const salons = await fetchCrmSalons()
  return filterDemoSalonsForViewer(salons, phone)
})

export type SalonLookupOptions = {
  preview?: boolean
}

export const getSalonById = cache(
  async (id: string, options: SalonLookupOptions = {}): Promise<Salon | undefined> => {
    const session = await getSession()
    const phone = session?.phone

    let salon: Salon | undefined

    if (isSupabaseConfigured()) {
      salon =
        (await fetchCrmSalonById(id, { allowUnpublished: options.preview })) ??
        undefined
    } else {
      salon = demoSalons.find((s) => s.id === id)
    }

    if (!salon) return undefined

    if (isRestrictedDemoSalon(salon) && !canViewerSeeDemoSalons(phone)) {
      return undefined
    }

    return salon
  },
)

/** Filter published salons by signup business type slug (or “all”). */
export async function getSalonsByCategory(category: string): Promise<Salon[]> {
  const salons = await getSalons()
  if (category === "all") return salons

  const needle = businessTypeSlugFromLabel(category)
  if (!needle) return salons

  return salons.filter(
    (salon) => businessTypeSlugFromLabel(salon.businessType) === needle,
  )
}
