"use client"

import { useEffect, useState } from "react"

import { resolveSessionGreeting } from "@/lib/auth/display"

export type SessionStatus = {
  authenticated: boolean | null
  welcomeName: string
}

const SESSION_STATUS_EVENT = "glammzo:session-status"

let cached: SessionStatus | null = null
let inflight: Promise<SessionStatus> | null = null

async function fetchSessionStatus(): Promise<SessionStatus> {
  try {
    const res = await fetch("/api/session")
    if (!res.ok) throw new Error("Failed to load session")
    const data = (await res.json()) as {
      authenticated?: boolean
      session?: { name?: string; phone?: string } | null
    }
    return {
      authenticated: Boolean(data?.authenticated),
      welcomeName: resolveSessionGreeting({
        name: data?.session?.name,
        phone: data?.session?.phone,
      }),
    }
  } catch {
    return { authenticated: false, welcomeName: "" }
  }
}

function loadSessionStatus() {
  if (cached) return Promise.resolve(cached)
  if (!inflight) {
    inflight = fetchSessionStatus().then((status) => {
      cached = status
      inflight = null
      return status
    })
  }
  return inflight
}

function notifySessionStatus(status: SessionStatus) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(SESSION_STATUS_EVENT, { detail: status }))
}

/** Shared client session status for navbar / mobile tab bar. */
export function useSessionStatus(): SessionStatus {
  const [status, setStatus] = useState<SessionStatus>(
    () => cached ?? { authenticated: null, welcomeName: "" },
  )

  useEffect(() => {
    let cancelled = false
    void loadSessionStatus().then((next) => {
      if (!cancelled) setStatus(next)
    })

    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<SessionStatus>).detail
      if (detail) setStatus(detail)
    }

    window.addEventListener(SESSION_STATUS_EVENT, onUpdate)
    return () => {
      cancelled = true
      window.removeEventListener(SESSION_STATUS_EVENT, onUpdate)
    }
  }, [])

  return status
}

export function invalidateSessionStatusCache() {
  cached = null
  inflight = null
}

/** Optimistically mark the client as logged out (e.g. before logout redirect). */
export function clearSessionStatus() {
  const status: SessionStatus = { authenticated: false, welcomeName: "" }
  cached = status
  inflight = null
  notifySessionStatus(status)
}

/** Force a fresh /api/session fetch (e.g. after profile save). */
export async function refreshSessionStatus() {
  invalidateSessionStatusCache()
  const status = await loadSessionStatus()
  notifySessionStatus(status)
  return status
}
