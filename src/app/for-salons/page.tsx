import type { Metadata } from "next"

import { ForSalonsLanding } from "@/components/for-salons/for-salons-landing"

export const metadata: Metadata = {
  title: "For salons",
  description:
    "Grow your salon with Glammzo — instant CRM access, online booking, and marketplace discovery.",
}

export default function ForSalonsPage() {
  return <ForSalonsLanding />
}
