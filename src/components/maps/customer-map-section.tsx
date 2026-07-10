"use client"

import dynamic from "next/dynamic"

import { MapSkeleton } from "@/components/maps/map-skeleton"

const CustomerSalonMap = dynamic(
  () => import("@/components/maps/customer-salon-map").then((mod) => mod.CustomerSalonMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
)

export function CustomerMapSection() {
  return <CustomerSalonMap />
}
