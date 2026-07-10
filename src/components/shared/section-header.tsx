import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: "left" | "center"
  theme?: "light" | "dark"
  className?: string
  action?: React.ReactNode
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  theme = "light",
  className,
  action,
}: SectionHeaderProps) {
  const isDark = theme === "dark"

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p
            className={cn(
              "section-eyebrow mb-3",
              isDark && "text-background/50"
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2 className={cn("display-section", isDark && "text-background")}>
          {title}
        </h2>
        {subtitle ? (
          <p
            className={cn(
              "mt-4 text-[15px] leading-7 sm:text-[17px]",
              isDark ? "text-background/65" : "text-foreground/65"
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
