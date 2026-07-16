"use client"

import { useEffect, useState } from "react"

const PARTICLES = [
  { left: "18%", delay: "0ms", drift: "-18px", size: 5, color: "var(--glam-coral)" },
  { left: "28%", delay: "80ms", drift: "12px", size: 4, color: "#f9a89a" },
  { left: "38%", delay: "40ms", drift: "-8px", size: 6, color: "var(--glam-sand)" },
  { left: "48%", delay: "120ms", drift: "16px", size: 4, color: "var(--glam-coral)" },
  { left: "58%", delay: "60ms", drift: "-14px", size: 5, color: "#e8d5c4" },
  { left: "68%", delay: "100ms", drift: "10px", size: 4, color: "#f9a89a" },
  { left: "78%", delay: "20ms", drift: "-10px", size: 5, color: "var(--glam-sand)" },
  { left: "88%", delay: "140ms", drift: "8px", size: 4, color: "var(--glam-coral)" },
] as const

/**
 * Soft one-shot confetti for the booking confirmation screen.
 * Non-interactive; removes itself after a short celebration.
 */
export function BookingSuccessConfetti() {
  const [active, setActive] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setActive(false), 2600)
    return () => window.clearTimeout(timer)
  }, [])

  if (!active) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-48 overflow-hidden"
      aria-hidden
    >
      <style>{`
        @keyframes booking-confetti-fall {
          0% {
            opacity: 0;
            transform: translate3d(0, -12px, 0) rotate(0deg) scale(0.7);
          }
          12% {
            opacity: 0.85;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--drift), 168px, 0) rotate(160deg) scale(0.55);
          }
        }
      `}</style>
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="absolute top-2 rounded-full"
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: 0.7,
            ["--drift" as string]: particle.drift,
            animation: `booking-confetti-fall 2.4s cubic-bezier(0.22, 1, 0.36, 1) ${particle.delay} both`,
          }}
        />
      ))}
    </div>
  )
}
