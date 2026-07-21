import type { ReactNode } from "react"

import { MotionSection } from "@/components/shared/motion"
import { cn } from "@/lib/utils"

type SalonDetailSectionProps = {
  id?: string
  eyebrow?: string
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function SalonDetailSection({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: SalonDetailSectionProps) {
  return (
    <MotionSection
      id={id}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={undefined}
      className={cn("py-8 sm:py-10", id && "scroll-mt-24", className)}
    >
      <header className="mb-5 max-w-2xl sm:mb-6">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-heading text-[1.75rem] font-semibold tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/65 sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </header>
      {children}
    </MotionSection>
  )
}
