"use client"

import { marqueeItems } from "@/data/site-copy"

export function MarqueeBand() {
  const track = [...marqueeItems, ...marqueeItems]

  return (
    <div
      className="marquee-band relative z-10 w-full border-y border-border/80 bg-foreground py-3.5 text-background"
      aria-hidden
    >
      <div className="marquee-viewport">
        <div className="marquee-track flex w-max whitespace-nowrap will-change-transform">
          {track.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex shrink-0 items-center px-6 font-heading text-sm font-medium uppercase tracking-[0.18em] sm:text-[15px]"
            >
              {item}
              <span className="ml-6 text-primary" aria-hidden>
                ·
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
