"use client"

import { SERVICE_GENDER_AUDIENCE_LABELS, type ServiceGenderAudience } from "@/lib/salons/gender-audience"
import { cn } from "@/lib/utils"

type UnisexAudiencePickerProps = {
  value?: ServiceGenderAudience | null
  onSelect: (value: ServiceGenderAudience) => void
  compact?: boolean
}

export function UnisexAudiencePicker({
  value = null,
  onSelect,
  compact = false,
}: UnisexAudiencePickerProps) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {(["men", "women"] as const).map((audience) => {
          const selected = value === audience
          return (
            <button
              key={audience}
              type="button"
              onClick={() => onSelect(audience)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                selected
                  ? "border-primary bg-primary/8 text-foreground ring-2 ring-primary/20"
                  : "border-border/70 bg-card/80 text-foreground/70 hover:border-foreground/25 hover:text-foreground",
              )}
            >
              {SERVICE_GENDER_AUDIENCE_LABELS[audience]}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="section-eyebrow">Start here</p>
        <h3 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
          Who are you booking for?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/65">
          This is a unisex salon. Choose men or women to see the matching services.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["men", "women"] as const).map((audience) => {
          const selected = value === audience
          return (
            <button
              key={audience}
              type="button"
              onClick={() => onSelect(audience)}
              className={cn(
                "min-h-28 rounded-2xl border px-5 py-6 text-left shadow-sm transition duration-200",
                selected
                  ? "border-primary bg-primary/8 ring-2 ring-primary/20"
                  : "border-border/70 bg-card/80 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md",
              )}
            >
              <p className="font-heading text-xl font-semibold">
                {SERVICE_GENDER_AUDIENCE_LABELS[audience]}
              </p>
              <p className="mt-1.5 text-sm text-foreground/60">
                {audience === "men"
                  ? "Haircuts, beard, and grooming"
                  : "Hair, beauty, and bridal"}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
