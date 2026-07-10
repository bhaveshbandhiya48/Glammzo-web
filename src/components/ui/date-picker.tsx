"use client"

import * as React from "react"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  WEEKDAY_LABELS,
  buildCalendarMonth,
  formatDisplayDate,
  isBeforeIso,
  isSameIso,
  monthYearLabel,
  parseIsoDate,
  toIsoDate,
} from "@/lib/date-utils"
import { cn } from "@/lib/utils"

export type DatePickerProps = {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
  className?: string
  "aria-label"?: string
}

export function DatePicker({
  id,
  name,
  value,
  onChange,
  min,
  max,
  disabled,
  required,
  placeholder = "Pick a date",
  className,
  "aria-label": ariaLabel = "Date",
}: DatePickerProps) {
  const initialAnchor = React.useMemo(
    () => parseIsoDate(value) ?? parseIsoDate(min ?? ""),
    [value, min]
  )
  const [todayIso, setTodayIso] = React.useState<string | null>(null)

  const [open, setOpen] = React.useState(false)
  const [viewYear, setViewYear] = React.useState(() => initialAnchor?.getFullYear() ?? 0)
  const [viewMonth, setViewMonth] = React.useState(() => initialAnchor?.getMonth() ?? 0)

  React.useEffect(() => {
    const nowIso = toIsoDate(new Date())
    setTodayIso(nowIso)

    if (initialAnchor) return
    const anchor = parseIsoDate(value) ?? parseIsoDate(min ?? nowIso) ?? new Date()
    setViewYear(anchor.getFullYear())
    setViewMonth(anchor.getMonth())
  }, [initialAnchor, value, min])

  React.useEffect(() => {
    if (!open) return
    const anchor =
      parseIsoDate(value) ??
      parseIsoDate(min ?? (todayIso ?? "")) ??
      (todayIso ? parseIsoDate(todayIso) : null) ??
      new Date()
    setViewYear(anchor.getFullYear())
    setViewMonth(anchor.getMonth())
  }, [open, value, min, todayIso])

  const cells = React.useMemo(
    () => buildCalendarMonth(viewYear, viewMonth),
    [viewYear, viewMonth]
  )

  const isDisabled = (iso: string) => {
    if (min && isBeforeIso(iso, min)) return true
    if (max && isBeforeIso(max, iso)) return true
    return false
  }

  const goMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  const selectDate = (iso: string) => {
    if (isDisabled(iso)) return
    onChange(iso)
    setOpen(false)
  }

  const displayValue = value ? formatDisplayDate(value) : ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {name ? (
        <input type="hidden" name={name} value={value} required={required} />
      ) : null}
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "relative flex h-11 w-full cursor-pointer items-center rounded-xl border border-input bg-background/60 pl-4 pr-12 text-left text-sm shadow-sm shadow-black/[0.02] transition-colors outline-none",
            "hover:border-border focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            !displayValue && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{displayValue || placeholder}</span>
          <span
            className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
            aria-hidden
          >
            <CalendarIcon className="size-4 shrink-0" strokeWidth={1.75} />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,18.5rem)] p-0" align="start">
        <div className="p-3 pb-2">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-heading text-sm font-semibold text-foreground">
              {monthYearLabel(viewYear, viewMonth)}
            </p>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => goMonth(-1)}
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Previous month"
              >
                <ChevronLeftIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => goMonth(1)}
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Next month"
              >
                <ChevronRightIcon className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className="py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {label}
              </span>
            ))}
            {cells.map((cell) => {
              const selectedDay = value && isSameIso(cell.iso, value)
              const today = todayIso ? isSameIso(cell.iso, todayIso) : false
              const dayDisabled = isDisabled(cell.iso)

              return (
                <button
                  key={cell.iso}
                  type="button"
                  disabled={dayDisabled}
                  onClick={() => selectDate(cell.iso)}
                  className={cn(
                    "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm transition-colors",
                    !cell.inMonth && "text-muted-foreground/45",
                    cell.inMonth && !selectedDay && "text-foreground",
                    today &&
                      !selectedDay &&
                      "font-semibold text-primary ring-1 ring-primary/35",
                    selectedDay &&
                      "bg-primary font-medium text-primary-foreground shadow-sm shadow-primary/20",
                    !selectedDay &&
                      !dayDisabled &&
                      "hover:bg-accent hover:text-accent-foreground",
                    dayDisabled &&
                      "cursor-not-allowed text-muted-foreground/35 hover:bg-transparent"
                  )}
                  aria-label={cell.date.toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  aria-pressed={selectedDay ? true : undefined}
                >
                  {cell.date.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/70 px-3 py-2">
          <button
            type="button"
            onClick={() => {
              onChange("")
              setOpen(false)
            }}
            className="cursor-pointer rounded-lg px-2 py-1.5 text-xs font-medium text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={!todayIso || isDisabled(todayIso)}
            onClick={() => {
              if (!todayIso) return
              selectDate(todayIso)
            }}
            className="cursor-pointer rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
