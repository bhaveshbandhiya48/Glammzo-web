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
  /** Mobile: hide eyebrow + subtitle, keep title only. Desktop unchanged. */
  compactTitleMobile?: boolean
}

export function SalonDetailSection({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
  compactTitleMobile = false,
}: SalonDetailSectionProps) {
  return (
    <MotionSection
      id={id}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={undefined}
      className={cn("py-8 sm:py-10", id && "scroll-mt-24", className)}
    >
      <header
        className={cn(
          "mb-5 max-w-2xl sm:mb-6",
          compactTitleMobile && "mb-2 lg:mb-6",
        )}
      >
        {eyebrow ? (
          <p
            className={cn(
              "text-xs font-semibold tracking-[0.2em] text-primary uppercase",
              compactTitleMobile && "hidden lg:block",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-heading text-[1.75rem] font-semibold tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h2>
        {subtitle ? (
          <p
            className={cn(
              "mt-3 text-[15px] leading-relaxed text-foreground/65 sm:text-base",
              compactTitleMobile && "hidden lg:block",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </header>
      {children}
    </MotionSection>
  )
}
