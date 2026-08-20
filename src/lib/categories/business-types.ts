import { getCategoryImage } from "@/data/media"
import type { Category } from "@/types/landing"

/**
 * Signup business types (CRM `settings.businessType`).
 * Keep labels in sync with glamzzo-crm `BUSINESS_TYPES`.
 */
export const BUSINESS_TYPES = [
  "Salon",
  "Unisex Salon",
  "Beauty Parlour",
  "Spa",
  "Nail Art Studio",
  "Yoga Center",
] as const

export type BusinessType = (typeof BUSINESS_TYPES)[number]

export type BusinessTypePresentation = {
  label: BusinessType
  slug: string
  title: string
  description: string
  icon: Category["icon"]
  imageUrl: string
  overlayBadge?: string
  variant: NonNullable<Category["variant"]>
}

export function normalizeBusinessTypeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const BUSINESS_TYPE_CATALOG: readonly BusinessTypePresentation[] = [
  {
    label: "Salon",
    slug: "salon",
    title: "Salons for everyday polish",
    description:
      "Cuts, colour, and styling from salons that show prices upfront and confirm online.",
    icon: "scissors",
    imageUrl: getCategoryImage("hair"),
    overlayBadge: "Popular",
    variant: "light",
  },
  {
    label: "Unisex Salon",
    slug: "unisex-salon",
    title: "Unisex salons for everyone",
    description:
      "One stop for men’s and women’s grooming, with clear menus and easy booking.",
    icon: "scissors",
    // Reuses hair imagery — swap when a dedicated unisex photo is ready.
    imageUrl: getCategoryImage("hair"),
    overlayBadge: "For all",
    variant: "sand",
  },
  {
    label: "Beauty Parlour",
    slug: "beauty-parlour",
    title: "Beauty parlours near you",
    description:
      "Facials, threading, waxing, and classic parlour treatments with transparent pricing.",
    icon: "sparkles",
    imageUrl: getCategoryImage("facial"),
    overlayBadge: "Glow",
    variant: "light",
  },
  {
    label: "Spa",
    slug: "spa",
    title: "Spas that actually reset you",
    description:
      "Massage, body rituals, and calm spaces chosen for recovery — not crowded waiting rooms.",
    icon: "sparkles",
    imageUrl: getCategoryImage("spa"),
    overlayBadge: "Relax",
    variant: "sand",
  },
  {
    label: "Nail Art Studio",
    slug: "nail-art-studio",
    title: "Nail studios, done properly",
    description:
      "Mani-pedis, gel work, and nail art from studios known for hygiene and detail.",
    icon: "hand",
    imageUrl: getCategoryImage("nails"),
    overlayBadge: "Trending",
    variant: "sand",
  },
  {
    label: "Yoga Center",
    slug: "yoga-center",
    title: "Yoga centers to reset",
    description:
      "Studios for classes and wellness sessions you can find and book without calling around.",
    icon: "sparkles",
    imageUrl: getCategoryImage("yoga"),
    overlayBadge: "Wellness",
    variant: "light",
  },
] as const

export function businessTypeSlugFromLabel(label: string | null | undefined) {
  if (!label?.trim()) return null
  const normalized = normalizeBusinessTypeSlug(label)
  const match = BUSINESS_TYPE_CATALOG.find(
    (entry) =>
      entry.slug === normalized || normalizeBusinessTypeSlug(entry.label) === normalized,
  )
  return match?.slug ?? normalized
}

export function getBusinessTypePresentation(slugOrLabel: string) {
  const slug = normalizeBusinessTypeSlug(slugOrLabel)
  return (
    BUSINESS_TYPE_CATALOG.find(
      (entry) =>
        entry.slug === slug || normalizeBusinessTypeSlug(entry.label) === slug,
    ) ?? null
  )
}
