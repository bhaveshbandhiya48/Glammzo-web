"use client"

import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type FaqItem = {
  question: string
  answer: string
}

type FaqAccordionProps = {
  items: readonly FaqItem[]
  className?: string
  /** Prefix for aria ids when multiple accordions are on a page. */
  idPrefix?: string
}

export function FaqAccordion({
  items,
  className,
  idPrefix = "faq",
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div
      className={cn(
        "divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/65 bg-card/80 shadow-sm shadow-black/[0.02]",
        className,
      )}
    >
      {items.map((item, index) => {
        const open = openIndex === index
        const panelId = `${idPrefix}-panel-${index}`
        const buttonId = `${idPrefix}-button-${index}`

        return (
          <div key={item.question} className="px-4 sm:px-5">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 py-4 text-left sm:py-5",
                  "font-heading text-base font-semibold tracking-tight text-foreground",
                  "transition-colors hover:text-foreground/80",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                )}
              >
                <span>{item.question}</span>
                <ChevronDownIcon
                  className={cn(
                    "size-4 shrink-0 text-foreground/45 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className={cn(!open && "hidden")}
            >
              <p className="pb-4 pr-8 text-sm leading-relaxed text-foreground/65 sm:pb-5">
                {item.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
