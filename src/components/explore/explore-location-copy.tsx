"use client"

import { useUserLocation } from "@/hooks/use-user-location"
import { formatLiveInCityBadge } from "@/lib/location"

export function ExplorePageTitle() {
  const { browseCity } = useUserLocation()
  return <>Salons in {browseCity}</>
}

type ExploreResultsSubtitleProps = {
  activeFilterLabel: string
  area: string
  nearMode: boolean
}

export function ExploreResultsSubtitle({
  activeFilterLabel,
  area,
  nearMode,
}: ExploreResultsSubtitleProps) {
  const { browseCity } = useUserLocation()

  if (nearMode) {
    return <>{activeFilterLabel} services · Sorted by distance from you</>
  }

  return (
    <>
      {activeFilterLabel} services{area ? ` · ${area}` : ` · ${browseCity}`}
    </>
  )
}

export function ExploreEmptyCityMessage() {
  const { browseCity } = useUserLocation()
  return (
    <>
      Try a different category or area. We&apos;re adding partners in {browseCity} every week.
    </>
  )
}

export function ExplorePartnerSubtitle() {
  const { browseCity } = useUserLocation()
  return (
    <>
      List your services, accept online bookings, and reach clients searching by area and category
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
