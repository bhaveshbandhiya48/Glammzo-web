import type { NavItem, Stat } from "@/types/landing"

/** Lightweight copy + nav, safe for client components (no salon/image graph). */
export const siteCopy = {
  brand: {
    name: "Glammzo",
    tagline: "Salon booking, made calm.",
    description:
      "Discover trusted salons, compare services with upfront pricing, and book your next appointment in minutes.",
  },
  social: [
    { label: "Instagram", href: "https://instagram.com/glammzo", icon: "instagram" },
    { label: "Facebook", href: "https://facebook.com/glammzo", icon: "facebook" },
    { label: "X", href: "https://x.com/glammzo", icon: "x" },
  ] as const,
  hero: {
    badge: "Now live near you",
    headline: "Your next salon visit,",
    headlineAccent: "booked in minutes.",
    subhead:
      "Glammzo helps you find the right salon, see real prices, and confirm appointments without phone calls or guesswork.",
    primaryCta: "Find a salon",
    secondaryCta: "See how it works",
    searchPlaceholder: "Service or salon",
    locationPlaceholder: "Area",
    socialProof: "Trusted by early users across the city",
  },
  statement: {
    eyebrow: "Why Glammzo",
    title: "Great salons. Zero phone tag.",
    subtitle:
      "Compare trusted studios, see prices upfront, and lock your slot in under two minutes — no calls, no back-and-forth.",
    cta: "Find salons near you",
  },
  stats: {
    eyebrow: "Glammzo today",
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "Three steps to your chair",
    subtitle: "Search, compare, and book. The flow stays simple whether it’s a quick trim or a full spa day.",
  },
  categories: {
    eyebrow: "Services",
    title: "Everything you book in one place",
    subtitle:
      "From everyday grooming to special occasion glam. Explore by category and book with clear pricing.",
  },
  salons: {
    eyebrow: "Featured partners",
    title: "Salons on Glammzo right now",
    subtitle:
      "We’re starting with hand picked partners. More cities and studios are on the way.",
    partnerCta: "Own a salon? Join us",
  },
  nearbySalonsMarquee: {
    eyebrow: "Near you",
    title: "Salons near you",
    subtitle: "Live listings within 10 km — tap any card to view services and book.",
    viewAllCta: "View all salons",
  },
  experience: {
    eyebrow: "The experience",
    title: "Premium salons. A booking flow that doesn’t get in the way.",
    subtitle:
      "Real photos, honest reviews, open hours, and instant confirmation so you spend less time coordinating and more time enjoying the visit.",
    previewLabel: "Upcoming visit",
    previewTitle: "Signature cut · Tomorrow 2:30 PM",
    previewDetail: "Velvet & Co. · Confirmed",
  },
  testimonials: {
    eyebrow: "Early feedback",
    title: "What our first users are saying",
    subtitle: "We’re a young product learning fast. Here’s what people love so far.",
  },
  partner: {
    eyebrow: "For salon owners",
    title: "Grow with Glammzo",
    subtitle:
      "Fill empty slots, reach new clients, and manage bookings from one calm dashboard built for independent studios and growing chains.",
  },
  mobile: {
    eyebrow: "Mobile app",
    title: "Glammzo in your pocket, coming soon",
    subtitle:
      "We’re polishing iOS and Android apps for rebooking, reminders, and saved favorites. Until then, the web experience works beautifully on mobile.",
    primaryCta: "Use web app",
    secondaryCta: "Join waitlist",
  },
} as const

export const navItems: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Explore", href: "/explore" },
  { label: "For salons", href: "/partner" },
]

export const stats: Stat[] = [
  {
    value: "4+",
    label: "Salon partners",
    description: "Verified listings live on Glammzo",
  },
  {
    value: "5",
    label: "Service categories",
    description: "Hair, skin, nails & more",
  },
  {
    value: "<2 min",
    label: "To confirm",
    description: "From search to booked slot",
  },
]

export const howItWorksSteps = [
  {
    num: "01",
    title: "Discover",
    description:
      "Search by service, area, or salon name. See ratings, distance, open status, and starting prices upfront.",
  },
  {
    num: "02",
    title: "Compare",
    description:
      "Browse services, durations, and reviews side by side, and pick what fits your schedule and budget.",
  },
  {
    num: "03",
    title: "Confirm",
    description:
      "Choose a time slot, book instantly, and get a clear confirmation with reminders included.",
  },
] as const

export const marqueeItems = [
  "Your city",
  "Hair & styling",
  "Spa & wellness",
  "Nails & makeup",
  "Transparent pricing",
  "Instant booking",
  "Premium for everyone",
]
