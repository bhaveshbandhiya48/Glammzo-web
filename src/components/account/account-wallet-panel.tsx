import Link from "next/link"
import { GiftIcon, WalletIcon } from "lucide-react"

import { formatInr } from "@/lib/salons/catalog-utils"
import type { WalletLedgerEntry } from "@/lib/wallet/customer-wallet"
import { Button } from "@/components/ui/button"

function reasonLabel(reason: string) {
  switch (reason) {
    case "cashback_first200":
      return "Welcome cashback"
    case "cashback_glammzo_offer":
      return "Glammzo cashback"
    case "wallet_redeem":
      return "Used on booking"
    case "wallet_restore":
      return "Refunded to wallet"
    case "adjustment":
      return "Adjustment"
    default:
      return reason.replaceAll("_", " ")
  }
}

type AccountWalletPanelProps = {
  balanceRupees: number
  completedVisits: number
  freeServiceCredits: number
  stampsTowardNextFree: number
  ledger: WalletLedgerEntry[]
}

export function AccountWalletPanel({
  balanceRupees,
  completedVisits,
  freeServiceCredits,
  stampsTowardNextFree,
  ledger,
}: AccountWalletPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
            <WalletIcon className="size-3.5 text-primary" aria-hidden />
            Wallet
          </p>
          <p className="mt-3 font-heading text-3xl font-semibold tabular-nums">
            {formatInr(balanceRupees)}
          </p>
          <p className="mt-1 text-sm text-foreground/55">Available for your next booking</p>
          <Button asChild className="mt-5" size="sm">
            <Link href="/explore">Book a salon</Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
            <GiftIcon className="size-3.5 text-primary" aria-hidden />
            Loyalty
          </p>
          <p className="mt-3 font-heading text-3xl font-semibold tabular-nums">
            {stampsTowardNextFree}
            <span className="text-lg text-foreground/40">/10</span>
          </p>
          <p className="mt-1 text-sm text-foreground/55">
            {completedVisits} completed visit{completedVisits === 1 ? "" : "s"} · {freeServiceCredits}{" "}
            loyalty credit{freeServiceCredits === 1 ? "" : "s"} (₹999 off)
          </p>
          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: 10 }).map((_, index) => (
              <span
                key={index}
                className={
                  index < stampsTowardNextFree
                    ? "h-2 flex-1 rounded-full bg-primary"
                    : "h-2 flex-1 rounded-full bg-border"
                }
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <h2 className="font-heading text-lg font-semibold">Wallet activity</h2>
        {ledger.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/55">
            No wallet activity yet. When you claim a Glammzo cashback offer, credits appear here after
            the visit.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {ledger.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium">{reasonLabel(entry.reason)}</p>
                  <p className="text-xs text-foreground/45">
                    {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p
                  className={
                    entry.deltaPaise > 0
                      ? "font-semibold tabular-nums text-emerald-700"
                      : "font-semibold tabular-nums text-foreground"
                  }
                >
                  {entry.deltaPaise > 0 ? "+" : ""}
                  {formatInr(entry.deltaPaise / 100)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
