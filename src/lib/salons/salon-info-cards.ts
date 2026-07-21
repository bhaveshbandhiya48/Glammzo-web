import {
  ClockIcon,
  CreditCardIcon,
  GlobeIcon,
  LanguagesIcon,
  MapPinIcon,
  ParkingCircleIcon,
  PhoneIcon,
  type LucideIcon,
} from "lucide-react"

import { findAmenityByIcon } from "@/lib/salons/salon-detail-utils"
import type { Salon } from "@/types/salon"

type InfoCard = {
  icon: LucideIcon
  title: string
  description: string
}

export function buildSalonInfoCards(salon: Salon): InfoCard[] {
  const amenities = salon.amenities?.categories ?? []
  const parking = findAmenityByIcon(amenities, "ParkingCircle")
  const cardPayment = findAmenityByIcon(amenities, "CreditCard")

  const cards: InfoCard[] = [
    {
      icon: MapPinIcon,
      title: "Address",
      description: salon.address,
    },
    {
      icon: ClockIcon,
      title: "Working hours",
      description: salon.hours,
    },
    {
      icon: PhoneIcon,
      title: "Phone",
      description: salon.phone,
    },
  ]

  if (salon.socialLinks?.website) {
    cards.push({
      icon: GlobeIcon,
      title: "Website",
      description: salon.socialLinks.website.replace(/^https?:\/\//, ""),
    })
  }

  if (cardPayment) {
    cards.push({
      icon: CreditCardIcon,
      title: "Payment",
      description: cardPayment.name,
    })
  }

  if (parking) {
    cards.push({
      icon: ParkingCircleIcon,
      title: "Parking",
      description: parking.name,
    })
  }

  if (salon.languages?.length) {
    cards.push({
      icon: LanguagesIcon,
      title: "Languages",
      description: salon.languages.join(", "),
    })
  }

  return cards
}
