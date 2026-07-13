"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type BookingFormCardProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
  contentClassName?: string
  action?: ReactNode
  sticky?: boolean
}

export function BookingFormCard({
  title,
  description,
  children,
  className,
  contentClassName,
  action,
  sticky = false,
}: BookingFormCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-xl border border-border/70 bg-card p-4 shadow-sm shadow-black/[0.03] sm:p-5",
        sticky && "xl:sticky xl:top-24 xl:z-10",
        className,
      )}
      aria-labelledby={`booking-card-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4">
        <div className="min-w-0">
          <h2
            id={`booking-card-${title.replace(/\s+/g, "-").toLowerCase()}`}
            className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-[1.05rem]"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className={cn("space-y-3", contentClassName)}>{children}</div>
    </motion.section>
  )
}
