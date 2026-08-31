"use client"

import { MinusIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type QuantityStepperProps = {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  /** When set, minus at `min` calls this instead of disabling. */
  onRemove?: () => void
  disabled?: boolean
  compact?: boolean
  label?: string
  className?: string
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  onRemove,
  disabled = false,
  compact = false,
  label,
  className,
}: QuantityStepperProps) {
  const safeValue = Number.isFinite(value) ? value : min
  const buttonClass = compact ? "size-7" : "size-8"
  const atMax = max != null && safeValue >= max
  const atMin = safeValue <= min
  const minusRemoves = Boolean(onRemove) && atMin

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {label ? (
        <span className="mr-1 text-[11px] font-medium text-foreground/55">{label}</span>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className={cn("shrink-0", buttonClass)}
        disabled={disabled || (atMin && !onRemove)}
        aria-label={minusRemoves ? "Remove" : "Decrease quantity"}
        onClick={() => {
          if (minusRemoves) {
            onRemove?.()
            return
          }
          onChange(Math.max(min, safeValue - 1))
        }}
      >
        <MinusIcon className={compact ? "size-3" : "size-3.5"} />
      </Button>
      <span
        className={cn(
          "min-w-6 text-center font-medium tabular-nums",
          compact ? "text-xs" : "min-w-7 text-sm",
        )}
      >
        {safeValue}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className={cn("shrink-0", buttonClass)}
        disabled={disabled || atMax}
        aria-label="Increase quantity"
        onClick={() =>
          onChange(max == null ? safeValue + 1 : Math.min(max, safeValue + 1))
        }
      >
        <PlusIcon className={compact ? "size-3" : "size-3.5"} />
      </Button>
    </div>
  )
}
