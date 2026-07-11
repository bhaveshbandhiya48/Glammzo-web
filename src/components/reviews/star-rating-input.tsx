"use client"

import { useState } from "react"
import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const RATING_LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"] as const

type StarRatingInputProps = {
  name: string
  value: number
  onChange: (value: number) => void
  id?: string
  className?: string
}

export function StarRatingInput({
  name,
  value,
  onChange,
  id,
  className,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const activeValue = hoverValue ?? value

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" name={name} value={value} />
      <div
        id={id}
        role="radiogroup"
        aria-label="Rating"
        className="flex items-center gap-1.5"
        onMouseLeave={() => setHoverValue(null)}
      >
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1
          const filled = starValue <= activeValue

          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={value === starValue}
              aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
              onMouseEnter={() => setHoverValue(starValue)}
              onFocus={() => setHoverValue(starValue)}
              onBlur={() => setHoverValue(null)}
              onClick={() => onChange(starValue)}
              className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <StarIcon
                className={cn(
                  "size-9 transition-colors sm:size-10",
                  filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-stone-300",
                )}
              />
            </button>
          )
        })}
      </div>
      <p className="text-sm font-medium text-foreground/70">{RATING_LABELS[activeValue - 1]}</p>
    </div>
  )
}
