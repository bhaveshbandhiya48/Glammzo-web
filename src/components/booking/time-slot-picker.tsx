"use client"

import { useMemo, useState } from "react"
import { ClockIcon } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type TimeSlotOption = {
  value: string
  label: string
  disabled?: boolean
  hint?: string
}

type TimeSlotPickerProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  hasDate: boolean
  waitingMessage?: string
  closed?: boolean
  closedMessage?: string
  emptyMessage?: string
  slots: TimeSlotOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  "aria-label"?: string
}

export function TimeSlotPicker({
  id,
  value,
  onChange,
  hasDate,
  waitingMessage = "Pick a date first",
  closed = false,
  closedMessage = "No slots available for this day.",
  emptyMessage = "No time slots fit your visit on this day.",
  slots,
  placeholder = "Select time",
  disabled = false,
  className,
  "aria-label": ariaLabel = "Time",
}: TimeSlotPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedLabel = useMemo(
    () => slots.find((slot) => slot.value === value && !slot.disabled)?.label ?? "",
    [slots, value],
  )

  const isUnavailable = !hasDate || (closed && slots.length === 0)
  const unavailableMessage = !hasDate
    ? waitingMessage
    : closed
      ? closedMessage
      : emptyMessage

  const hasSelectableSlot = slots.some((slot) => !slot.disabled)

  const selectSlot = (slot: TimeSlotOption) => {
    if (slot.disabled) return
    onChange(slot.value)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled || isUnavailable}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "relative flex h-11 w-full cursor-pointer items-center rounded-xl border border-input bg-background/60 pl-4 pr-12 text-left text-sm shadow-sm shadow-black/[0.02] transition-colors outline-none",
            "hover:border-border focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            !selectedLabel && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {selectedLabel ||
              (isUnavailable
                ? unavailableMessage
                : hasSelectableSlot
                  ? placeholder
                  : "All slots booked")}
          </span>
          <span
            className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
            aria-hidden
          >
            <ClockIcon className="size-4 shrink-0" strokeWidth={1.75} />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(100vw-2rem,18rem)] p-0"
        align="start"
      >
        <div className="border-b border-border/70 px-3 py-2.5">
          <p className="font-heading text-sm font-semibold text-foreground">Time slots</p>
        </div>
        <div className="max-h-64 overflow-y-auto p-3">
          {slots.length === 0 ? (
            <p className="px-1 py-2 text-center text-xs text-foreground/55">{emptyMessage}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot) => {
                const active = value === slot.value && !slot.disabled

                return (
                  <button
                    key={slot.value}
                    type="button"
                    disabled={slot.disabled}
                    aria-disabled={slot.disabled || undefined}
                    title={slot.label}
                    onClick={() => selectSlot(slot)}
                    className={cn(
                      "rounded-xl border px-2 py-2 text-center transition-colors",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
                      slot.disabled &&
                        "cursor-not-allowed border-dashed border-border/60 bg-muted/40 text-foreground/40 line-through decoration-foreground/30",
                      !slot.disabled &&
                        (active
                          ? "cursor-pointer border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "cursor-pointer border-border/80 bg-background hover:border-primary/30 hover:bg-accent/40"),
                    )}
                  >
                    <span className="block text-xs font-medium whitespace-nowrap sm:text-sm">
                      {slot.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        {value ? (
          <div className="border-t border-border/70 px-3 py-2">
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
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
