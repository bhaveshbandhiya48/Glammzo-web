import { media } from "@/data/media"
import { salonCustomerReviews } from "@/data/salon-reviews"
import { salonTeamBySalonId } from "@/data/salon-team"
import type { Salon, SalonService } from "@/types/salon"

const categoryServiceImage: Record<string, string> = {
  Hair: media.categories.hair,
  Spa: media.categories.spa,
  Nails: media.categories.nails,
  Makeup: media.categories.makeup,
  Grooming: media.categories.grooming,
  Massage: media.categories.spa,
  Relaxation: media.categories.spa,
  "Body Treatments": media.categories.spa,
  General: media.categories.spa,
}

function withServiceImage(
  service: Omit<SalonService, "imageUrl">,
): SalonService {
  return {
    ...service,
    imageUrl: categoryServiceImage[service.category] ?? media.categories.spa,
  }
}

export const demoSalons: Salon[] = [
  {
    id: "s1",
    name: "Velvet & Co. Studio",
    area: "Indiranagar",
    imageUrl: media.salons.s1,
    coverImageUrl: media.salons.s1,
    rating: 4.8,
    reviews: 1240,
    distanceKm: 1.2,
    isOpenNow: true,
    priceFrom: 799,
    description:
      "A calm, design-forward studio for cuts, color, and styling. Transparent pricing and experienced stylists.",
    address: "12th Main, Indiranagar, Bengaluru",
    phone: "+91 98765 43210",
    hours: "Mon–Sun · 10:00 AM – 9:00 PM",
    gallery: [media.salons.s1, media.categories.hair],
    customerReviews: salonCustomerReviews.s1,
    team: salonTeamBySalonId.s1,
    services: [
      {
        id: "s1-1",
        name: "Signature Haircut",
        durationMin: 45,
        price: 799,
        category: "Hair",
        includes: ["Style consultation", "Hair wash", "Precision cut", "Blow-dry finish"],
      },
      {
        id: "s1-2",
        name: "Blowout & Styling",
        durationMin: 40,
        price: 699,
        category: "Hair",
        includes: ["Scalp massage", "Wash & condition", "Professional blowout", "Heat styling"],
      },
      {
        id: "s1-3",
        name: "Root Touch-up",
        durationMin: 90,
        price: 2499,
        category: "Hair",
        includes: ["Colour consultation", "Root application", "Processing time", "Rinse & blow-dry"],
      },
      {
        id: "s1-4",
        name: "Deep Conditioning",
        durationMin: 30,
        price: 599,
        category: "Hair",
        includes: ["Hair analysis", "Deep mask treatment", "Steam therapy", "Light finish"],
      },
    ].map(withServiceImage),
  },
  {
    id: "s2",
    name: "Aurora Skin & Spa",
    area: "Koramangala",
    imageUrl: media.salons.s2,
    coverImageUrl: media.salons.s2,
    rating: 4.7,
    reviews: 860,
    distanceKm: 2.6,
    isOpenNow: true,
    priceFrom: 999,
    description:
      "Spa rituals and facials in a serene space. Perfect for reset days and special occasions.",
    address: "5th Block, Koramangala, Bengaluru",
    phone: "+91 98765 43211",
    hours: "Tue–Sun · 11:00 AM – 8:00 PM",
    gallery: [media.salons.s2, media.categories.spa],
    customerReviews: salonCustomerReviews.s2,
    team: salonTeamBySalonId.s2,
    services: [
      {
        id: "s2-1",
        name: "Express Facial",
        durationMin: 45,
        price: 999,
        category: "Spa",
        includes: ["Skin assessment", "Cleanse & exfoliate", "Custom mask", "Moisturiser & SPF"],
      },
      {
        id: "s2-2",
        name: "Swedish Massage",
        durationMin: 60,
        price: 1799,
        category: "Spa",
        includes: ["Consultation", "Full-body massage", "Aromatherapy oil", "Relaxation time"],
      },
      {
        id: "s2-3",
        name: "Aromatherapy Ritual",
        durationMin: 75,
        price: 2199,
        category: "Spa",
        includes: ["Scent selection", "Body scrub", "Warm oil massage", "Herbal tea"],
      },
    ].map(withServiceImage),
  },
  {
    id: "s3",
    name: "Blush Nails Atelier",
    area: "HSR Layout",
    imageUrl: media.salons.s3,
    coverImageUrl: media.salons.s3,
    rating: 4.6,
    reviews: 540,
    distanceKm: 3.1,
    isOpenNow: false,
    priceFrom: 699,
    description:
      "Nail art, gel extensions, and classic mani-pedis with a minimalist, premium finish.",
    address: "Sector 2, HSR Layout, Bengaluru",
    phone: "+91 98765 43212",
    hours: "Wed–Mon · 11:00 AM – 7:30 PM",
    gallery: [media.salons.s3, media.categories.nails],
    customerReviews: salonCustomerReviews.s3,
    team: salonTeamBySalonId.s3,
    services: [
      {
        id: "s3-1",
        name: "Classic Manicure",
        durationMin: 35,
        price: 699,
        category: "Nails",
        includes: ["Nail shaping", "Cuticle care", "Hand massage", "Polish application"],
      },
      {
        id: "s3-2",
        name: "Gel Extensions",
        durationMin: 90,
        price: 1899,
        category: "Nails",
        includes: ["Nail prep", "Gel extension set", "Shape & refine", "Top coat cure"],
      },
      {
        id: "s3-3",
        name: "Nail Art Add-on",
        durationMin: 20,
        price: 499,
        category: "Nails",
        includes: ["Design consultation", "Accent nails", "Detailing & gems", "Sealing top coat"],
      },
    ].map(withServiceImage),
  },
  {
    id: "s4",
    name: "Studio Sora Beauty",
    area: "MG Road",
    imageUrl: media.salons.s4,
    coverImageUrl: media.salons.s4,
    rating: 4.9,
    reviews: 1520,
    distanceKm: 4.4,
    isOpenNow: true,
    priceFrom: 1199,
    description:
      "Full-service beauty studio for hair, makeup, and grooming with editorial-quality results.",
    address: "MG Road, Bengaluru",
    phone: "+91 98765 43213",
    hours: "Mon–Sat · 10:00 AM – 8:00 PM",
    gallery: [media.salons.s4, media.categories.makeup],
    customerReviews: salonCustomerReviews.s4,
    team: salonTeamBySalonId.s4,
    services: [
      {
        id: "s4-1",
        name: "Party Makeup",
        durationMin: 60,
        price: 2499,
        category: "Makeup",
        includes: ["Look consultation", "Skin prep", "Full face makeup", "Setting spray"],
      },
      {
        id: "s4-2",
        name: "Bridal Trial",
        durationMin: 90,
        price: 3999,
        category: "Makeup",
        includes: ["Style planning", "Trial application", "Photo check", "Product notes"],
      },
      {
        id: "s4-3",
        name: "Beard Grooming",
        durationMin: 30,
        price: 599,
        category: "Grooming",
        includes: ["Beard trim", "Line-up & shape", "Hot towel", "Beard oil finish"],
      },
      {
        id: "s4-4",
        name: "Hair Styling",
        durationMin: 45,
        price: 1199,
        category: "Hair",
        includes: ["Style consult", "Prep & protect", "Event-ready styling", "Finishing products"],
      },
    ].map(withServiceImage),
  },
]

export function getDemoSalonById(id: string) {
  return demoSalons.find((s) => s.id === id)
}

export function getDemoSalonsByCategory(category: string) {
  if (category === "all") return demoSalons
  return demoSalons.filter((s) =>
    s.services.some((svc) => svc.category.toLowerCase() === category.toLowerCase())
  )
}
