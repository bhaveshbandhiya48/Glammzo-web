"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { UserRoundIcon } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { BookableStaffMember } from "@/lib/bookings/crm/types"
import { cn } from "@/lib/utils"

type StaffPickerProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  members: BookableStaffMember[]
  disabled?: boolean
  placeholder?: string
  className?: string
  "aria-label"?: string
}

export function StaffPicker({
  id,
  value,
  onChange,
  members,
  disabled = false,
  placeholder = "Select team member",
  className,
  "aria-label": ariaLabel = "Preferred team member",
}: StaffPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedMember = useMemo(
    () => members.find((member) => member.id === value) ?? null,
    [members, value],
  )

  const selectMember = (nextValue: string) => {
    onChange(nextValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled || members.length === 0}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "relative flex h-11 w-full cursor-pointer items-center rounded-xl border border-input bg-background/60 pl-4 pr-12 text-left text-sm shadow-sm shadow-black/[0.02] transition-colors outline-none",
            "hover:border-border focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            !selectedMember && value !== "" && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {value === ""
              ? "Any available professional"
              : selectedMember?.name ?? placeholder}
          </span>
          <span
            className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
            aria-hidden
          >
            <UserRoundIcon className="size-4 shrink-0" strokeWidth={1.75} />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,20rem)] p-2" align="start">
        <div className="max-h-64 space-y-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => selectMember("")}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
              value === ""
                ? "bg-primary/10 text-foreground"
                : "hover:bg-accent/50",
            )}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground/55">
              <UserRoundIcon className="size-4" />
            </span>
            <span>
              <span className="block font-medium">Any available professional</span>
              <span className="mt-0.5 block text-xs text-foreground/55">
                We&apos;ll match you with someone free
              </span>
            </span>
          </button>

          {members.map((member) => {
            const active = value === member.id

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => selectMember(member.id)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  active ? "bg-primary/10 text-foreground" : "hover:bg-accent/50",
                )}
              >
                <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                  {member.imageUrl ? (
                    <Image
                      src={member.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-foreground/45">
                      <UserRoundIcon className="size-4" />
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{member.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-foreground/55">
                    {member.role}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
