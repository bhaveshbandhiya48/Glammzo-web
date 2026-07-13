"use client"

import * as React from "react"
import { format, isValid, parseISO, startOfDay, subYears } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DateInputProps = Omit<React.ComponentProps<"input">, "type" | "value"> & {
  value?: string | number | readonly string[]
  /** Applies birth-date range limits and opens around a typical adult age. */
  birthDate?: boolean
  placeholder?: string
}

function parseDateValue(value?: string | number | readonly string[]) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined
  }

  const parsed = parseISO(value)

  return isValid(parsed) ? parsed : undefined
}

function formatDisplayValue(value?: string | number | readonly string[]) {
  const parsed = parseDateValue(value)

  if (!parsed) {
    return null
  }

  return format(parsed, "dd MMM yyyy")
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      className,
      value,
      defaultValue,
      onChange,
      onBlur,
      name,
      id,
      disabled,
      required,
      min,
      max,
      birthDate = false,
      placeholder = "Select date",
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const [uncontrolledValue, setUncontrolledValue] = React.useState(
      typeof defaultValue === "string" ? defaultValue : "",
    )

    const isControlled = value !== undefined
    const currentValue = isControlled
      ? typeof value === "string"
        ? value
        : ""
      : uncontrolledValue

    const selectedDate = parseDateValue(currentValue)
    const displayValue = formatDisplayValue(currentValue)
    const minDate = parseDateValue(typeof min === "string" ? min : undefined)
    const maxDate = parseDateValue(typeof max === "string" ? max : undefined)
    const today = startOfDay(new Date())
    const birthDateStartMonth = subYears(today, 120)
    const birthDateDefaultMonth = subYears(today, 30)
    const calendarEndMonth = birthDate ? (maxDate ?? today) : maxDate
    const calendarStartMonth = birthDate ? (minDate ?? birthDateStartMonth) : minDate
    const calendarDefaultMonth = selectedDate ?? (birthDate ? birthDateDefaultMonth : undefined)

    const emitChange = (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue)
      }

      onChange?.({
        target: { value: nextValue, name: name ?? "" },
        currentTarget: { value: nextValue, name: name ?? "" },
      } as React.ChangeEvent<HTMLInputElement>)
    }

    const handleSelect = (date: Date | undefined) => {
      if (!date) {
        return
      }

      const nextValue = format(date, "yyyy-MM-dd")
      emitChange(nextValue)
      setOpen(false)
    }

    const handleOpenChange = (nextOpen: boolean) => {
      setOpen(nextOpen)

      if (!nextOpen) {
        onBlur?.({
          target: { value: currentValue, name: name ?? "" },
          currentTarget: { value: currentValue, name: name ?? "" },
        } as React.FocusEvent<HTMLInputElement>)
      }
    }

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            disabled={disabled}
            aria-required={required}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={cn(
              "flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-xl border border-input bg-background/60 px-4 py-2 text-left text-sm text-foreground shadow-sm shadow-black/[0.02] transition-colors outline-none hover:border-foreground/25 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              !displayValue && "text-muted-foreground",
              className,
            )}
          >
            <span className="truncate">{displayValue ?? placeholder}</span>
            <CalendarIcon className="size-4 shrink-0 text-primary/70" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            defaultMonth={calendarDefaultMonth}
            startMonth={calendarStartMonth}
            endMonth={calendarEndMonth}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(calendarEndMonth ? [{ after: calendarEndMonth }] : []),
            ]}
          />
        </PopoverContent>

        <input
          ref={ref}
          type="hidden"
          name={name}
          value={currentValue}
          required={required}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
        />
      </Popover>
    )
  },
)

DateInput.displayName = "DateInput"

export { DateInput }
