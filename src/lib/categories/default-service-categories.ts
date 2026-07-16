import "server-only"

import { cache } from "react"

import { categories as fallbackCategories } from "@/data/landing"
import { media } from "@/data/media"
import { getSalons } from "@/lib/salons"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"
import type { Category } from "@/types/landing"
import type { SalonService } from "@/types/salon"

type DefaultCategoryTemplateRow = {
  name: string
  slug: string
  sort_order: number
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function categoryImage(slug: string) {
  if (/(nail|manicure|pedicure|gel)/.test(slug)) return media.categories.nails
  if (/(makeup|bridal|brow|lash)/.test(slug)) return media.categories.makeup
  if (/(groom|beard|barber|haircut)/.test(slug)) return media.categories.grooming
  if (
    /(spa|massage|facial|skin|body|wellness|yoga|meditation|therapy|steam)/.test(slug)
  ) {
    return media.categories.spa
  }
  return media.categories.hair
}

function categoryIcon(slug: string): Category["icon"] {
  if (/(nail|manicure|pedicure|gel)/.test(slug)) return "hand"
  if (/(makeup|bridal|brow|lash)/.test(slug)) return "brush"
  if (/(groom|beard|barber)/.test(slug)) return "user"
  if (/(spa|massage|facial|skin|body|wellness|yoga|therapy)/.test(slug)) {
    return "sparkles"
  }
  return "scissors"
}

function buildCategory(
  template: DefaultCategoryTemplateRow,
  services: SalonService[],
): Category {
  const existingPresentation = fallbackCategories.find(
    (category) => category.id === template.slug,
  )
  const sortedServices = [...services].sort((left, right) => left.price - right.price)
  const featured = sortedServices[0]
  const serviceNames = Array.from(new Set(services.map((service) => service.name))).slice(0, 4)

  return {
    id: template.slug,
    title: existingPresentation?.title ?? `${template.name}, from trusted professionals`,
    subtitle: serviceNames.slice(0, 2).join(", ") || template.name,
    icon: existingPresentation?.icon ?? categoryIcon(template.slug),
    services: serviceNames,
    eyebrow: template.name,
    description:
      existingPresentation?.description ??
      `Discover published salons offering ${template.name.toLowerCase()} services with transparent pricing and online booking.`,
    imageUrl: existingPresentation?.imageUrl ?? categoryImage(template.slug),
    overlay: {
      badge: existingPresentation?.overlay.badge,
      title: template.name,
      subtitle: featured
        ? `${services.length} service${services.length === 1 ? "" : "s"} · From ₹${Math.round(featured.price).toLocaleString("en-IN")}`
        : undefined,
    },
    variant: existingPresentation?.variant ?? (template.sort_order % 2 === 0 ? "sand" : "light"),
  }
}

async function loadDefaultTemplates(): Promise<DefaultCategoryTemplateRow[]> {
  if (!isSupabaseConfigured()) {
    return fallbackCategories.map((category, index) => ({
      name: category.eyebrow,
      slug: category.id,
      sort_order: index + 1,
    }))
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("default_category_templates")
    .select("name, slug, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[categories] Failed to load default templates:", error.message)
    return []
  }

  const unique = new Map<string, DefaultCategoryTemplateRow>()
  for (const row of (data ?? []) as DefaultCategoryTemplateRow[]) {
    const slug = normalizeSlug(row.slug || row.name)
    const existing = unique.get(slug)
    if (!existing || row.sort_order < existing.sort_order) {
      unique.set(slug, { ...row, slug })
    }
  }

  return Array.from(unique.values()).sort(
    (left, right) => left.sort_order - right.sort_order || left.name.localeCompare(right.name),
  )
}

/**
 * Returns only global default-template categories that are currently offered
 * by at least one published salon. Custom salon categories never create cards.
 */
export const getBrowseDefaultCategories = cache(async (): Promise<Category[]> => {
  const [templates, salons] = await Promise.all([loadDefaultTemplates(), getSalons()])
  const servicesByCategory = new Map<string, SalonService[]>()

  for (const salon of salons) {
    for (const service of salon.services) {
      const slug = normalizeSlug(service.category)
      const list = servicesByCategory.get(slug) ?? []
      list.push(service)
      servicesByCategory.set(slug, list)
    }
  }

  return templates
    .map((template) => {
      const services = servicesByCategory.get(template.slug) ?? []
      return services.length > 0 ? buildCategory(template, services) : null
    })
    .filter((category): category is Category => category !== null)
})
