"use client"

import { useSalonCatalogContext } from "@/providers/salon-catalog-provider"

export function useSalonCatalog() {
  return useSalonCatalogContext()
}
