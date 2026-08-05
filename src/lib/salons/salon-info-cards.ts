import {
  ClockIcon,
  GlobeIcon,
  LanguagesIcon,
  MapPinIcon,
  PhoneIcon,
  type LucideIcon,
} from "lucide-react"

import { getAmenityIcon } from "@/lib/salons/amenity-icons"
import { findAmenityByIcons } from "@/lib/salons/salon-detail-utils"
import type { Salon } from "@/types/salon"

type InfoCard = {
  icon: LucideIcon
  title: string
  description: string
}

export function buildSalonInfoCards(salon: Salon): InfoCard[] {
  const amenities = salon.amenities?.categories ?? []
  const parking = findAmenityByIcons(amenities, ["CircleParking", "ParkingCircle", "Car"])
  const cardPayment = findAmenityByIcons(amenities, ["CreditCard", "Smartphone", "Nfc"])

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
      icon: getAmenityIcon(cardPayment.icon, cardPayment.name),
      title: "Payment",
      description: cardPayment.name,
    })
  }

  if (parking) {
    cards.push({
      icon: getAmenityIcon(parking.icon, parking.name),
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
