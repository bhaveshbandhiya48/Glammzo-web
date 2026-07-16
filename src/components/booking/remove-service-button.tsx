import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type RemoveServiceButtonProps = {
  serviceName: string
  onClick: () => void
  className?: string
  position?: "inline" | "corner"
}

export function RemoveServiceButton({
  serviceName,
  onClick,
  className,
  position = "inline",
}: RemoveServiceButtonProps) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="outline"
      className={cn(
        "border-destructive/40 bg-background text-destructive shadow-sm",
        "hover:border-destructive/55 hover:bg-red-50 hover:text-destructive",
        position === "corner" &&
          "absolute top-0 right-0 z-10 -translate-y-1/2 translate-x-1/2",
        className,
      )}
      onClick={onClick}
      aria-label={`Remove ${serviceName}`}
    >
      <XIcon strokeWidth={2.5} />
    </Button>
  )
}
