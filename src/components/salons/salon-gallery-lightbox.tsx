"use client"

import { useCallback, useEffect, useRef } from "react"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { Button } from "@/components/ui/button"

type SalonGalleryLightboxProps = {
  gallery: string[]
  salonName: string
  index: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onIndexChange: (index: number) => void
}

export function SalonGalleryLightbox({
  gallery,
  salonName,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: SalonGalleryLightboxProps) {
  const touchStartX = useRef<number | null>(null)
  const swipeThreshold = 48

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + gallery.length) % gallery.length)
  }, [gallery.length, index, onIndexChange])

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % gallery.length)
  }, [gallery.length, index, onIndexChange])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        goPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        goNext()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, goPrev, goNext])

  const src = gallery[index]

  if (!src) return null

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col outline-none"
          aria-describedby={undefined}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogPrimitive.Title className="sr-only">
            {salonName} gallery photo {index + 1} of {gallery.length}
          </DialogPrimitive.Title>

          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
            <p className="text-sm tabular-nums text-white/80">
              {index + 1} / {gallery.length}
            </p>
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10 hover:text-white"
                aria-label="Close gallery"
              >
                <XIcon className="size-5" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6 sm:px-12"
            onTouchStart={(event) => {
              touchStartX.current = event.changedTouches[0]?.clientX ?? null
            }}
            onTouchEnd={(event) => {
              if (touchStartX.current === null) return
              const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
              const delta = endX - touchStartX.current
              touchStartX.current = null
              if (delta <= -swipeThreshold) goNext()
              else if (delta >= swipeThreshold) goPrev()
            }}
          >
            {gallery.length > 1 ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 text-white hover:bg-white/10 hover:text-white sm:inline-flex"
                  aria-label="Previous photo"
                  onClick={goPrev}
                >
                  <ChevronLeftIcon className="size-8" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 text-white hover:bg-white/10 hover:text-white sm:inline-flex"
                  aria-label="Next photo"
                  onClick={goNext}
                >
                  <ChevronRightIcon className="size-8" />
                </Button>
              </>
            ) : null}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={src}
              src={src}
              alt={`${salonName} gallery photo ${index + 1}`}
              className="max-h-[calc(100dvh-5.5rem)] max-w-full select-none object-contain"
              draggable={false}
            />
          </div>

          {gallery.length > 1 ? (
            <p className="pb-4 text-center text-xs text-white/50 sm:hidden">
              Swipe left or right to browse
            </p>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
