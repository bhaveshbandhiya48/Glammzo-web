import { getCategoryImage, media } from "@/data/media"
import { salons as allSalons } from "@/data/salons"
import type { Category, Salon, Testimonial } from "@/types/landing"

export {
  siteCopy,
  navItems,
  stats,
  howItWorksSteps,
  marqueeItems,
} from "@/data/site-copy"

export const categories: Category[] = [
  {
    id: "hair",
    title: "Hair that feels like you",
    subtitle: "Cuts, color, styling",
    icon: "scissors",
    services: ["Haircuts", "Color & highlights", "Blowouts", "Treatments"],
    eyebrow: "Hair",
    description:
      "Precision cuts, colour, and styling from stylists who explain options and pricing before you sit down.",
    imageUrl: getCategoryImage("hair"),
    overlay: {
      badge: "Popular",
      title: "Signature cut",
      subtitle: "From ₹799 · 45 min",
    },
    variant: "light",
  },
  {
    id: "spa",
    title: "Spa days that actually reset you",
    subtitle: "Facials, massage",
    icon: "sparkles",
    services: ["Facials", "Massage", "Body rituals", "Aromatherapy"],
    eyebrow: "Spa",
    description:
      "Facials, massage, and body rituals in spaces chosen for calm, not crowded, noisy waiting areas.",
    imageUrl: getCategoryImage("spa"),
    overlay: {
      badge: "Relax",
      title: "Swedish massage",
      subtitle: "60 min · From ₹1,799",
    },
    variant: "sand",
  },
  {
    id: "nails",
    title: "Nails, done properly",
    subtitle: "Mani, pedi, art",
    icon: "hand",
    services: ["Manicure", "Pedicure", "Nail art", "Gel & extensions"],
    eyebrow: "Nails",
    description:
      "Classic mani-pedis, gel work, and nail art from studios known for hygiene and attention to detail.",
    imageUrl: getCategoryImage("nails"),
    overlay: {
      badge: "Trending",
      title: "Gel manicure",
      subtitle: "45 min · From ₹899",
    },
    variant: "light",
  },
  {
    id: "makeup",
    title: "Makeup for real life",
    subtitle: "Everyday to glam",
    icon: "brush",
    services: ["Bridal", "Party glam", "Everyday looks", "Lashes & brows"],
    eyebrow: "Makeup",
    description:
      "Artists for weddings, events, and everyday polish, with trials available so there are no day-of surprises.",
    imageUrl: getCategoryImage("makeup"),
    overlay: {
      badge: "Events",
      title: "Party makeup",
      subtitle: "From ₹2,499",
    },
    variant: "sand",
  },
  {
    id: "grooming",
    title: "Grooming, on your schedule",
    subtitle: "Beard, brows, skincare",
    icon: "user",
    services: ["Beard trim", "Facial grooming", "Brow shaping", "Skincare"],
    eyebrow: "Grooming",
    description:
      "Quick beard, brow, and skincare appointments that fit between meetings, with walk-ins where partners allow.",
    imageUrl: getCategoryImage("grooming"),
    overlay: {
      badge: "Quick",
      title: "Beard grooming",
      subtitle: "30 min · From ₹599",
    },
    variant: "light",
  },
]

export const nearbySalons: Salon[] = allSalons.map(
  ({ id, name, area, imageUrl, rating, reviews, distanceKm, isOpenNow, priceFrom }) => ({
    id,
    name,
    area,
    imageUrl,
    rating,
    reviews,
    distanceKm,
    isOpenNow,
    priceFrom,
  })
)

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Ananya Rao",
    role: "Early user · Indiranagar",
    quote:
      "I finally know what I’m paying before I walk in. Booking took less than a minute, with no awkward WhatsApp back-and-forth.",
    avatarUrl: media.testimonials.t1,
  },
  {
    id: "t2",
    name: "Meera Kapoor",
    role: "Early user · Koramangala",
    quote:
      "The salon pages feel thoughtful: open hours, services, reviews. It’s premium without being intimidating.",
    avatarUrl: media.testimonials.t2,
  },
  {
    id: "t3",
    name: "Sahil Verma",
    role: "Early user · HSR Layout",
    quote:
      "I rebook the same barber every few weeks. The flow is fast on mobile and the confirmations are actually useful.",
    avatarUrl: media.testimonials.t3,
  },
]
