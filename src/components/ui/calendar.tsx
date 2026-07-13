"use client"

import * as React from "react"
import { addYears, format, startOfMonth, subYears } from "date-fns"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"
import { DayPicker, useDayPicker, type MonthCaptionProps } from "react-day-picker"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const calendarWidth = "w-[calc(7*2.25rem)]"

const navButtonClassName =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card p-0 text-foreground shadow-xs transition-colors hover:border-foreground/20 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/10 disabled:pointer-events-none disabled:opacity-40"

function CalendarMonthCaption(props: MonthCaptionProps) {
  const { calendarMonth, displayIndex: _displayIndex, className, ...divProps } = props
  const { goToMonth, previousMonth, nextMonth, dayPickerProps } = useDayPicker()
  const { startMonth, endMonth } = dayPickerProps

  const currentMonth = startOfMonth(calendarMonth.date)
  const previousYearMonth = subYears(currentMonth, 1)
  const nextYearMonth = addYears(currentMonth, 1)

  const canGoToPreviousYear =
    !startMonth || previousYearMonth >= startOfMonth(startMonth)
  const canGoToNextYear = !endMonth || nextYearMonth <= startOfMonth(endMonth)

  return (
    <div
      {...divProps}
      className={cn("flex w-full items-center justify-between gap-2", className)}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={navButtonClassName}
          aria-label="Previous year"
          disabled={!canGoToPreviousYear}
          onClick={() => {
            if (canGoToPreviousYear) {
              goToMonth(previousYearMonth)
            }
          }}
        >
          <ChevronsLeftIcon className="size-4" />
        </button>
        <button
          type="button"
          className={navButtonClassName}
          aria-label="Previous month"
          disabled={!previousMonth}
          onClick={() => {
            if (previousMonth) {
              goToMonth(previousMonth)
            }
          }}
        >
          <ChevronLeftIcon className="size-4" />
        </button>
      </div>

      <div className="px-1 text-sm font-semibold text-foreground" aria-live="polite">
        {format(calendarMonth.date, "MMMM yyyy")}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={navButtonClassName}
          aria-label="Next month"
          disabled={!nextMonth}
          onClick={() => {
            if (nextMonth) {
              goToMonth(nextMonth)
            }
          }}
        >
          <ChevronRightIcon className="size-4" />
        </button>
        <button
          type="button"
          className={navButtonClassName}
          aria-label="Next year"
          disabled={!canGoToNextYear}
          onClick={() => {
            if (canGoToNextYear) {
              goToMonth(nextYearMonth)
            }
          }}
        >
          <ChevronsRightIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  weekStartsOn = 1,
  hideNavigation = true,
  captionLayout = "label",
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={weekStartsOn}
      captionLayout={captionLayout}
      hideNavigation={hideNavigation}
      className={cn("w-fit p-3", className)}
      classNames={{
        months: "flex w-fit flex-col gap-2",
        month: cn(calendarWidth, "flex flex-col gap-3"),
        month_caption: "w-full",
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full",
        weekday:
          "flex w-9 items-center justify-center text-[0.75rem] font-medium text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "relative flex w-9 items-center justify-center p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 rounded-lg p-0 font-normal hover:bg-muted/50 hover:text-foreground aria-selected:opacity-100",
        ),
        selected:
          "rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "rounded-lg bg-muted/40 font-medium text-foreground",
        outside: "text-muted-foreground/45 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        MonthCaption: CalendarMonthCaption,
      }}
      {...props}
    />
  )
}

export { Calendar }
