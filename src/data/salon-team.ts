import { media } from "@/data/media"
import type { SalonTeamMember } from "@/types/salon"

export const salonTeamBySalonId: Record<string, SalonTeamMember[]> = {
  s1: [
    {
      id: "s1-t1",
      name: "Ananya R.",
      role: "Senior Stylist",
      imageUrl: media.testimonials.t1,
      specialties: ["Signature Haircut", "Blowout & Styling", "Event styling"],
    },
    {
      id: "s1-t2",
      name: "Meera J.",
      role: "Color Specialist",
      imageUrl: media.testimonials.t2,
      specialties: ["Root Touch-up", "Full colour", "Gloss treatments"],
    },
    {
      id: "s1-t3",
      name: "Karan M.",
      role: "Styling Lead",
      imageUrl: media.testimonials.t3,
      specialties: ["Blowout & Styling", "Texture work", "Finishing"],
    },
    {
      id: "s1-t4",
      name: "Rohit S.",
      role: "Junior Stylist",
      imageUrl: media.categories.hair,
      specialties: ["Deep Conditioning", "Haircuts", "Wash & blow-dry"],
    },
  ],
  s2: [
    {
      id: "s2-t1",
      name: "Priya K.",
      role: "Lead Esthetician",
      imageUrl: media.testimonials.t1,
      specialties: ["Express Facial", "Skin assessment", "Sensitive skin care"],
    },
    {
      id: "s2-t2",
      name: "Arjun N.",
      role: "Massage Therapist",
      imageUrl: media.testimonials.t2,
      specialties: ["Swedish Massage", "Deep tissue", "Pressure-focused work"],
    },
    {
      id: "s2-t3",
      name: "Sofia L.",
      role: "Spa Therapist",
      imageUrl: media.testimonials.t3,
      specialties: ["Aromatherapy Ritual", "Body rituals", "Relaxation therapies"],
    },
    {
      id: "s2-t4",
      name: "Divya P.",
      role: "Guest Relations",
      imageUrl: media.categories.spa,
      specialties: ["Visit coordination", "Therapist matching", "Spa consultations"],
    },
  ],
  s3: [
    {
      id: "s3-t1",
      name: "Riya K.",
      role: "Lead Nail Artist",
      imageUrl: media.testimonials.t1,
      specialties: ["Gel Extensions", "Classic Manicure", "Shape & structure"],
    },
    {
      id: "s3-t2",
      name: "Tara M.",
      role: "Nail Artist",
      imageUrl: media.testimonials.t2,
      specialties: ["Nail Art Add-on", "Custom designs", "Accent detailing"],
    },
    {
      id: "s3-t3",
      name: "Anika D.",
      role: "Nail Technician",
      imageUrl: media.testimonials.t3,
      specialties: ["Classic Manicure", "Cuticle care", "Polish application"],
    },
  ],
  s4: [
    {
      id: "s4-t1",
      name: "Kavya S.",
      role: "Makeup Artist",
      imageUrl: media.testimonials.t1,
      specialties: ["Party Makeup", "Editorial looks", "Long-wear base"],
    },
    {
      id: "s4-t2",
      name: "Neha V.",
      role: "Bridal Specialist",
      imageUrl: media.testimonials.t2,
      specialties: ["Bridal Trial", "Wedding day makeup", "Touch-up planning"],
    },
    {
      id: "s4-t3",
      name: "Ishita P.",
      role: "Hair Stylist",
      imageUrl: media.testimonials.t3,
      specialties: ["Hair Styling", "Volume & texture", "Evening looks"],
    },
    {
      id: "s4-t4",
      name: "Aditya R.",
      role: "Grooming Expert",
      imageUrl: media.categories.grooming,
      specialties: ["Beard Grooming", "Line-ups", "Men's finishing"],
    },
  ],
}
