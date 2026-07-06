"use client"

import { useState } from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

type CategoryImageProps = {
  src: string
  alt: string
  priority?: boolean
  className?: string
}

export function CategoryImage({ src, alt, priority, className }: CategoryImageProps) {
  const [failed, setFailed] = useState(false)
  const isLocal = src.startsWith("/")

  if (failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full object-cover object-center", className)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={!isLocal}
      priority={priority}
      sizes="(max-width: 768px) 100vw, 520px"
      className={cn("!h-full !w-full object-cover object-center", className)}
      onError={() => setFailed(true)}
    />
  )
}
