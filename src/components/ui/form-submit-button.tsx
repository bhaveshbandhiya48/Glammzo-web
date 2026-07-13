"use client"

import { useFormStatus } from "react-dom"
import { Loader2Icon } from "lucide-react"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FormSubmitButtonProps = ComponentProps<typeof Button> & {
  pendingLabel?: string
}

export function FormSubmitButton({
  children,
  pendingLabel = "Saving…",
  className,
  disabled,
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className={cn(className)}
      disabled={disabled || pending}
      aria-busy={pending}
      {...props}
    >
      {pending ? (
        <>
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
