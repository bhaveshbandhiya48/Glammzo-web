"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/** Reset scroll position when navigating between pages (App Router). */
export function NavigationScrollManager() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname])

  return null
}
