"use client"

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

/** API markers — animations are CSS-based (no framer-motion / webpack HMR issues). */
export const fadeUp = Symbol("fadeUp")
export const fadeUpSubtle = Symbol("fadeUpSubtle")
export const stagger = Symbol("stagger")

type Viewport = { once?: boolean; margin?: string }

type MotionProps = {
  children?: ReactNode
  className?: string
  initial?: false | "hidden"
  animate?: "show"
  whileInView?: "show"
  viewport?: Viewport
  variants?: typeof fadeUp | typeof fadeUpSubtle | typeof stagger
}

export function MotionProvider({ children }: { children: ReactNode }) {
  return children
}

function useSectionVisible({
  initial,
  animate,
  whileInView,
  viewport,
}: Omit<MotionProps, "children" | "className" | "variants">) {
  const ref = useRef<HTMLElement | null>(null)
  const startVisible = initial === false || (animate === "show" && !whileInView)
  const [visible, setVisible] = useState(startVisible)

  useEffect(() => {
    if (startVisible) {
      setVisible(true)
      return
    }
    if (!whileInView) return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (viewport?.once !== false) observer.disconnect()
        } else if (viewport?.once === false) {
          setVisible(false)
        }
      },
      { rootMargin: viewport?.margin ?? "-60px", threshold: 0.06 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [startVisible, whileInView, viewport?.margin, viewport?.once])

  return { ref, visible }
}

export const MotionSection = forwardRef<
  HTMLElement,
  MotionProps & ComponentPropsWithoutRef<"section">
>(function MotionSection(
  {
    className,
    children,
    variants,
    initial,
    animate,
    whileInView,
    viewport,
    ...rest
  },
  forwardedRef
) {
  const { ref, visible } = useSectionVisible({ initial, animate, whileInView, viewport })

  const setRef = (node: HTMLElement | null) => {
    ref.current = node
    if (typeof forwardedRef === "function") {
      forwardedRef(node)
    } else if (forwardedRef) {
      forwardedRef.current = node
    }
  }

  return (
    <section
      ref={setRef}
      className={cn(
        "motion-section",
        variants === stagger && "motion-stagger",
        variants === fadeUpSubtle && "motion-fade-subtle",
        variants === fadeUp && "motion-fade",
        visible && "motion-visible",
        className
      )}
      {...rest}
    >
      {children}
    </section>
  )
})

/** Child of MotionSection — animates when parent gets .motion-visible */
export function MotionDiv({
  className,
  children,
  variants,
  ...rest
}: MotionProps & ComponentPropsWithoutRef<"div">) {
  const isChild =
    variants === fadeUp || variants === fadeUpSubtle || variants === undefined

  if (!isChild) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "motion-item",
        variants === fadeUpSubtle && "motion-item-subtle",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function MotionHeader({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"header">) {
  return (
    <header className={className} {...rest}>
      {children}
    </header>
  )
}
