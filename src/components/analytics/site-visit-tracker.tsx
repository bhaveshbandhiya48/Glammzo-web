"use client"

import { useEffect, useRef } from "react"

import { getVisitLocationSnapshot } from "@/lib/location-storage"

export function SiteVisitTracker() {
  const sent = useRef(false)

  useEffect(() => {
    if (sent.current) return

    const timer = window.setTimeout(() => {
      if (sent.current) return
      sent.current = true
      void sendVisit()
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [])

  return null
}

async function sendVisit() {
  try {
    const snapshot = await getVisitLocationSnapshot()
    await fetch("/api/site-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationGranted: snapshot.granted,
        locationLabel: snapshot.label,
      }),
      keepalive: true,
    })
  } catch {
    // Visit tracking should never block browsing.
  }
}
