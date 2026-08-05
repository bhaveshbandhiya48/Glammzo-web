import {
  AccessibilityIcon,
  AirVentIcon,
  ArmchairIcon,
  ArrowUpDownIcon,
  BabyIcon,
  BathIcon,
  CarIcon,
  CctvIcon,
  CircleParkingIcon,
  CoffeeIcon,
  CreditCardIcon,
  DoorClosedIcon,
  DoorOpenIcon,
  GlassWaterIcon,
  NfcIcon,
  ParkingCircleIcon,
  PawPrintIcon,
  PlugIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SparklesIcon,
  SprayCanIcon,
  VenusIcon,
  WifiIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react"

import { resolveAmenityIconId } from "@/lib/salons/amenity-catalog"

/** Mirrors the CRM amenity icon map so both apps render the same glyph. */
const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  Wifi: WifiIcon,
  ParkingCircle: ParkingCircleIcon,
  CircleParking: CircleParkingIcon,
  Car: CarIcon,
  Coffee: CoffeeIcon,
  CreditCard: CreditCardIcon,
  Armchair: ArmchairIcon,
  Accessibility: AccessibilityIcon,
  Baby: BabyIcon,
  Sparkles: SparklesIcon,
  AirVent: AirVentIcon,
  Zap: ZapIcon,
  Plug: PlugIcon,
  Smartphone: SmartphoneIcon,
  Nfc: NfcIcon,
  ArrowUpDown: ArrowUpDownIcon,
  Bath: BathIcon,
  PawPrint: PawPrintIcon,
  Venus: VenusIcon,
  DoorClosed: DoorClosedIcon,
  DoorOpen: DoorOpenIcon,
  GlassWater: GlassWaterIcon,
  ShieldCheck: ShieldCheckIcon,
  SprayCan: SprayCanIcon,
  Cctv: CctvIcon,
}

export function getAmenityIcon(icon: string | null | undefined, name?: string | null): LucideIcon {
  return AMENITY_ICON_MAP[resolveAmenityIconId(icon, name)] ?? SparklesIcon
}
