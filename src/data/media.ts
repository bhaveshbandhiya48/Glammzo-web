/**
 * Glammzo media — curated salon booking imagery (Unsplash + Pexels).
 * Re-sync: npm run media:sync · Credits: src/data/media-credits.ts
 */

export const media = {
  categories: {
    hair: "/images/categories/hair.jpg",
    spa: "/images/categories/spa.jpg",
    nails: "/images/categories/nails.jpg",
    makeup: "/images/categories/makeup.jpg",
    grooming: "/images/categories/grooming.jpg",
  },
  salons: {
    s1: "/images/salons/s1.jpg",
    s2: "/images/salons/s2.jpg",
    s3: "/images/salons/s3.jpg",
    s4: "/images/salons/s4.jpg",
  },
  hero: {
    featured: "/images/hero/featured.jpg",
  },
  sections: {
    featuredExperience: "/images/sections/featured-experience.jpg",
    mobileApp: "/images/sections/mobile-app.jpg",
  },
  auth: {
    salon: "/images/auth/salon.jpg",
  },
  testimonials: {
    t1: "/images/testimonials/t1.jpg",
    t2: "/images/testimonials/t2.jpg",
    t3: "/images/testimonials/t3.jpg",
  },
} as const

export type CategoryMediaId = keyof typeof media.categories

export function getCategoryImage(id: CategoryMediaId) {
  return media.categories[id]
}
