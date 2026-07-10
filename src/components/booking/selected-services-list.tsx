import Image from "next/image"

import { RemoveServiceButton } from "@/components/booking/remove-service-button"
import type { SalonService } from "@/types/salon"
import { cn } from "@/lib/utils"

type SelectedServicesListProps = {
  services: SalonService[]
  onRemove: (id: string) => void
  className?: string
}

function ServiceThumbnail({ service }: { service: SalonService }) {
  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30 sm:size-14">
      <Image
        src={service.imageUrl}
        alt=""
        fill
        className="object-cover"
        sizes="56px"
      />
    </div>
  )
}

export function SelectedServicesList({
  services,
  onRemove,
  className,
}: SelectedServicesListProps) {
  return (
    <ul className={cn("space-y-4 overflow-visible pt-1.5 pr-1.5", className)}>
      {services.map((svc) => (
        <li
          key={svc.id}
          className="relative overflow-visible rounded-xl border border-border/60 bg-background/60 p-3"
        >
          <RemoveServiceButton
            serviceName={svc.name}
            onClick={() => onRemove(svc.id)}
            position="corner"
          />
          <div className="flex items-start gap-3">
            <ServiceThumbnail service={svc} />
            <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-snug">{svc.name}</p>
                <p className="mt-0.5 text-sm text-foreground/60">
                  {svc.category} · {svc.durationMin} min
                </p>
              </div>
              <span className="shrink-0 font-heading text-base font-semibold tabular-nums leading-none">
                ₹{svc.price}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
