"use client"

import { useUserLocation } from "@/hooks/use-user-location"
import { formatLiveInCityBadge } from "@/lib/location"

export function ExplorePageTitle() {
  const { browseCity } = useUserLocation()
  return <>Salons in {browseCity}</>
}

export function ExplorePartnerSubtitle() {
  const { browseCity } = useUserLocation()
  return (
    <>
      List your business, accept online bookings, and reach clients searching by area and type
      in {browseCity}.
    </>
  )
}

export function HeroLiveBadge() {
  const { browseCity } = useUserLocation()
  return <>{formatLiveInCityBadge(browseCity)}</>
}

export function HeroAreaPlaceholder() {
  const { browseCity } = useUserLocation()
  return <>Area in {browseCity}</>
}
