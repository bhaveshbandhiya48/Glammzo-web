export type NavItem = {
  label: string
  href: string
}

export type Stat = {
  label: string
  value: string
  description?: string
}

export type Category = {
  id: string
  title: string
  subtitle: string
  icon: "scissors" | "sparkles" | "hand" | "brush" | "user"
  services: string[]
  eyebrow: string
  description: string
  imageUrl: string
  overlay: {
    badge?: string
    title: string
    subtitle?: string
  }
  variant?: "light" | "sand"
}

export type Salon = {
  id: string
  name: string
  area: string
  imageUrl: string
  rating: number
  reviews: number
  distanceKm: number
  isOpenNow: boolean
  priceFrom: number
}

export type Testimonial = {
  id: string
  name: string
  role: string
  quote: string
  avatarUrl: string
}

