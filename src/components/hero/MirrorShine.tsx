"use client"

import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

import { usePageVisible } from "@/hooks/use-page-visible"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

const SHINE_DURATION_MS = 900

function randomIntervalMs() {
  return 7000 + Math.random() * 3000
}

export function MirrorShine() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const pageVisible = usePageVisible()
  const [active, setActive] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const scheduleShine = useCallback(() => {
    clearTimers()

    const waitId = setTimeout(() => {
      if (document.visibilityState !== "visible") {
        scheduleShine()
        return
      }

      setActive(true)
      const endId = setTimeout(() => {
        setActive(false)
        scheduleShine()
      }, SHINE_DURATION_MS)
      timersRef.current.push(endId)
    }, randomIntervalMs())

    timersRef.current.push(waitId)
  }, [clearTimers])

  useEffect(() => {
    if (prefersReducedMotion) return

    if (pageVisible) {
      scheduleShine()
    } else {
      clearTimers()
      setActive(false)
    }

    return clearTimers
  }, [prefersReducedMotion, pageVisible, scheduleShine, clearTimers])

  if (prefersReducedMotion) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-1/2 -top-1/2 h-[200%] w-[200%]"
        initial={false}
        animate={
          active
            ? {
                x: ["-8%", "38%"],
                opacity: [0, 0.35, 0],
              }
            : { x: "-8%", opacity: 0 }
        }
        transition={{
          duration: SHINE_DURATION_MS / 1000,
          ease: [0.45, 0, 0.25, 1],
        }}
        style={{
          background:
            "linear-gradient(115deg, transparent 44%, rgba(255,255,255,0.22) 50%, transparent 56%)",
          mixBlendMode: "soft-light",
          willChange: "transform, opacity",
        }}
      />
    </div>
  )
}
