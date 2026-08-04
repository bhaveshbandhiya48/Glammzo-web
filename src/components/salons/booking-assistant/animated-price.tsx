"use client"

import { useEffect, useState } from "react"
import { useSpring } from "framer-motion"

import { formatInr } from "@/lib/salons/catalog-utils"
import { cn } from "@/lib/utils"

type AnimatedPriceProps = {
  value: number
  className?: string
}

export function AnimatedPrice({ value, className }: AnimatedPriceProps) {
  const spring = useSpring(value, { stiffness: 140, damping: 22, mass: 0.55 })
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    spring.set(value)
    const unsubscribe = spring.on("change", (latest) => {
      setDisplay(Math.round(latest))
    })
    return unsubscribe
  }, [spring, value])

  // Plain span — avoid motion `layout` here. Layout projections can overlay
  // parent links/buttons and swallow clicks after price updates (e.g. apply offer).
  return <span className={cn("tabular-nums", className)}>{formatInr(display)}</span>
}
