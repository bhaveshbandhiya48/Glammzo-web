"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

function clearStuckBodyPointerEvents() {
  const hasOpenOverlay = document.querySelector(
    '[data-slot="dialog-overlay"][data-state="open"], [data-slot="sheet-overlay"][data-state="open"]',
  )
  if (!hasOpenOverlay && document.body.style.pointerEvents === "none") {
    document.body.style.pointerEvents = ""
  }
}

/** Reset scroll position when navigating between pages (App Router). */
export function NavigationScrollManager() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    clearStuckBodyPointerEvents()
  }, [pathname])

  useEffect(() => {
    clearStuckBodyPointerEvents()
    window.addEventListener("focus", clearStuckBodyPointerEvents)
    return () => window.removeEventListener("focus", clearStuckBodyPointerEvents)
  }, [])

  return null
}
