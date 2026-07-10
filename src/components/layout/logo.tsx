import Link from "next/link"

import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
  inverse?: boolean
  size?: "md" | "lg" | "xl"
}

export function Logo({ className, inverse = false, size = "md" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Glammzo home"
      className={cn("inline-flex items-center rounded-xl px-2 py-1 transition-opacity hover:opacity-80", className)}
    >
      <span
        className={cn(
          "font-logo text-[1.12em] font-bold leading-none tracking-[-0.02em]",
          size === "xl"
            ? "text-[1.85rem] sm:text-[2.15rem] lg:text-[2.5rem]"
            : size === "lg"
              ? "text-[1.6rem] sm:text-[1.75rem]"
              : "text-[1.2rem]",
          inverse ? "text-background" : "text-foreground"
        )}
      >
        Glamm<span className="text-primary">zo</span>
      </span>
    </Link>
  )
}
