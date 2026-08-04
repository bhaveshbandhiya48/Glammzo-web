import type { Metadata } from "next"
import Link from "next/link"

import { buildAndListSettlementsForMonth } from "@/lib/wallet/settlements"
import { formatInr } from "@/lib/salons/catalog-utils"
import { PageHeader } from "@/components/layout/page-header"
import { SitePageShell } from "@/components/layout/site-page-shell"
import { isCronRequestAuthorized } from "@/lib/env/cron-auth"

export const metadata: Metadata = {
  title: "Wallet settlements",
  robots: { index: false },
}

type SearchParams = Promise<{
  year?: string
  month?: string
  key?: string
}>

/**
 * Lightweight ops view for month-end salon reimbursements.
 * Open with ?key=CRON_SECRET (Authorization bearer equivalent).
 */
export default async function WalletSettlementsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const authorized =
    Boolean(params.key) &&
    isCronRequestAuthorized(
      new Request("http://local/ops", {
        headers: { authorization: `Bearer ${params.key}` },
      }),
    )

  if (!authorized) {
    return (
      <SitePageShell>
        <div className="mx-auto max-w-lg py-16 text-center">
          <h1 className="font-heading text-2xl font-semibold">Settlements</h1>
          <p className="mt-3 text-sm text-foreground/60">
            Unauthorized. Pass a valid cron key, or use the JSON API at
            /api/ops/wallet-settlements.
          </p>
          <p className="mt-6 text-sm">
            <Link href="/" className="text-primary underline-offset-2 hover:underline">
              Back home
            </Link>
          </p>
        </div>
      </SitePageShell>
    )
  }

  const year = Number(params.year) || undefined
  const month = Number(params.month) || undefined
  const result = await buildAndListSettlementsForMonth({ year, month })
  const total = result.rows.reduce((sum, row) => sum + row.amountRupees, 0)

  return (
    <SitePageShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <PageHeader
          eyebrow="Ops"
          title="Salon wallet settlements"
          subtitle={`Period ${result.periodStart} to ${result.periodEnd}. Glammzo reimburses salons for wallet redemptions and free-service value.`}
          className="mb-8"
        />
        <p className="mb-6 text-sm text-foreground/60">
          Built {result.built} settlement row{result.built === 1 ? "" : "s"} · Total owed{" "}
          <span className="font-semibold text-foreground">{formatInr(total)}</span>
        </p>
        {result.rows.length === 0 ? (
          <p className="text-sm text-foreground/55">No reimbursable ledger activity for this period.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/70">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs tracking-wide text-foreground/50 uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Salon</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Settlement ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {result.rows.map((row) => (
                  <tr key={row.settlementId}>
                    <td className="px-4 py-3 font-medium">{row.salonName}</td>
                    <td className="px-4 py-3 tabular-nums">{formatInr(row.amountRupees)}</td>
                    <td className="px-4 py-3 capitalize">{row.status}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground/50">
                      {row.settlementId.slice(0, 8)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SitePageShell>
  )
}
