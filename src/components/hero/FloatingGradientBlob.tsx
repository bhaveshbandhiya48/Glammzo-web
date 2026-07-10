"use client"

import { usePageVisible } from "@/hooks/use-page-visible"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export function FloatingGradientBlob() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const pageVisible = usePageVisible()
  const animate = !prefersReducedMotion && pageVisible

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 -z-[9] overflow-hidden",
        animate && "hero-floating-blob-active"
      )}
      aria-hidden
    >
      <div className="hero-floating-blob" />
    </div>
  )
}
