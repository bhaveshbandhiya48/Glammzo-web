"use client"

import type { ComponentProps } from "react"

import { logoutAction } from "@/lib/auth/auth-actions"
import { FormSubmitButton } from "@/components/ui/form-submit-button"
import { cn } from "@/lib/utils"

type LogoutFormButtonProps = ComponentProps<typeof FormSubmitButton> & {
  pendingLabel?: string
}

export function LogoutFormButton({
  children = "Logout",
  pendingLabel = "Logging out…",
  className,
  ...props
}: LogoutFormButtonProps) {
  return (
    <form action={logoutAction}>
      <FormSubmitButton
        className={cn(className)}
        pendingLabel={pendingLabel}
        {...props}
      >
        {children}
      </FormSubmitButton>
    </form>
  )
}

type LogoutMenuButtonProps = {
  className?: string
  pendingLabel?: string
}

export function LogoutMenuButton({
  className,
  pendingLabel = "Logging out…",
}: LogoutMenuButtonProps) {
  return (
    <form action={logoutAction}>
      <FormSubmitButton
        variant="ghost"
        pendingLabel={pendingLabel}
        className={cn(
          "h-auto w-full justify-start px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent",
          className,
        )}
      >
        Logout
      </FormSubmitButton>
    </form>
  )
}
