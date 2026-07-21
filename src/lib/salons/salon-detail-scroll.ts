export const SALON_SERVICES_SECTION_ID = "services"

export function salonServicesSectionHref(salonId: string) {
  return `/salons/${encodeURIComponent(salonId)}#${SALON_SERVICES_SECTION_ID}`
}

export function scrollToSalonServicesSection() {
  const target = document.getElementById(SALON_SERVICES_SECTION_ID)
  if (!target) return false

  target.scrollIntoView({ behavior: "smooth", block: "start" })

  if (typeof window !== "undefined" && window.location.hash !== `#${SALON_SERVICES_SECTION_ID}`) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${SALON_SERVICES_SECTION_ID}`,
    )
  }

  return true
}
