import type { ReactNode } from "react"

import { Container } from "@/components/layout/container"
import { cn } from "@/lib/utils"

/**
 * Section bands — shared with Home:
 * base → light wash · statement → sand · featured → warm coral tint · dark → foreground
 */
export type PageSectionTone = "default" | "base" | "statement" | "featured" | "dark"

const toneClasses: Record<PageSectionTone, string> = {
  default: "",
  base: "section-band-base",
  statement: "section-band-statement",
  featured: "section-band-featured",
  dark: "section-band-dark",
}

type PageSectionPadding = "default" | "none" | "bottom-only"

type PageSectionProps = {
  children: ReactNode
  className?: string
  containerClassName?: string
  bordered?: boolean
  /** Marks a visual band transition — always keeps full vertical padding */
  separated?: boolean
  tone?: PageSectionTone
  padding?: PageSectionPadding
  bleed?: boolean
}

/** Standard vertical section padding — use on all marketing / content sections */
export function PageSection({
  children,
  className,
  containerClassName,
  bordered = false,
  separated = false,
  tone = "default",
  padding = "default",
  bleed = false,
}: PageSectionProps) {
  const isBand = tone !== "default"

  return (
    <section
      className={cn(
        padding === "default" && "section-y",
        padding === "none" && "py-0",
        padding === "bottom-only" && "section-y-b",
        (separated || isBand) && "section-y-separated",
        bordered && tone === "default" && "border-b border-border/60",
        toneClasses[tone],
        className
      )}
    >
      {bleed ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  )
}
