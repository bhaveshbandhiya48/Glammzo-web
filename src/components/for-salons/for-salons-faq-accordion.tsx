"use client"

import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { cn } from "@/lib/utils"

type FaqItem = {
  q: string
  a: string
}

type ForSalonsFaqAccordionProps = {
  items: readonly FaqItem[]
  className?: string
}

export function ForSalonsFaqAccordion({ items, className }: ForSalonsFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className={cn("divide-y divide-border/70 border-y border-border/70", className)}>
      {items.map((item, index) => {
        const open = openIndex === index
        const panelId = `for-salons-faq-panel-${index}`
        const buttonId = `for-salons-faq-button-${index}`

        return (
          <div key={item.q}>
            <Container>
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(open ? null : index)}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 py-5 text-left sm:py-6",
                    "font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg",
                    "transition-colors hover:text-foreground/80",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  )}
                >
                  <span>{item.q}</span>
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
                <p className="max-w-3xl pb-5 pr-8 text-sm leading-relaxed text-foreground/65 sm:pb-6 sm:text-base">
                  {item.a}
                </p>
              </div>
            </Container>
          </div>
        )
      })}
    </div>
  )
}
