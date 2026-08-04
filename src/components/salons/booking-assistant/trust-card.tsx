"use client"

import {
  BadgeCheckIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

const TRUST_ITEMS = [
  { icon: ZapIcon, label: "Instant confirmation" },
  { icon: BadgeCheckIcon, label: "Verified salons" },
  { icon: LockKeyholeIcon, label: "Secure payments" },
  { icon: ShieldCheckIcon, label: "Best price guarantee" },
] as const

export type TrustCardProps = {
  className?: string
}

export function TrustCard({ className }: TrustCardProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border/60 bg-muted/25 px-5 py-4",
        className,
      )}
    >
      <h3 className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
        Why book with Glammzo
      </h3>
      <ul className="mt-3 grid grid-cols-1 gap-2.5">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5 text-sm text-foreground/70">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm shadow-black/[0.03]">
              <Icon className="size-3.5" aria-hidden />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </section>
  )
}
