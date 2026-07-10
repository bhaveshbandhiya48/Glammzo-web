"use client"

import { useState, useTransition } from "react"
import { HeartIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { toggleFavoriteSalonAction } from "@/lib/favorites/actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FavoriteSalonButtonProps = {
  salonId: string
  crmSalonId?: string
  initialFavorited?: boolean
  authenticated: boolean
  className?: string
  size?: "sm" | "default"
}

export function FavoriteSalonButton({
  salonId,
  crmSalonId,
  initialFavorited = false,
  authenticated,
  className,
  size = "sm",
}: FavoriteSalonButtonProps) {
  const router = useRouter()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()

  if (!crmSalonId) return null

  if (!authenticated) {
    return (
      <Button
        type="button"
        size={size}
        variant="outline"
        className={cn("rounded-full", className)}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          router.push(`/login?next=${encodeURIComponent(`/salons/${salonId}`)}`)
        }}
      >
        <HeartIcon className="size-4" />
        <span className="sr-only">Sign in to save</span>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      size={size}
      variant="outline"
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      className={cn(
        "rounded-full",
        favorited && "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15",
        className,
      )}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        startTransition(async () => {
          const result = await toggleFavoriteSalonAction(crmSalonId)
          if (result.success) {
            setFavorited(result.favorited)
          }
        })
      }}
    >
      <HeartIcon className={cn("size-4", favorited && "fill-current")} />
    </Button>
  )
}
