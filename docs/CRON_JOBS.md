# Scheduled cron jobs (Glammzo-web)

Production background work is exposed as `GET` routes under `/api/cron/*`. Each request must include:

```http
Authorization: Bearer <CRON_SECRET>
```

Set `CRON_SECRET` in `.env.production` (same value as glamzzo-crm is fine). Required in production via `assertProductionSecretsConfigured`.

Consumer booking **SMS** reminders / decline-expire notices are **disabled** (CRM WhatsApp handles salon↔customer messaging). These crons still matter for **wallet cashback** after completed visits.

## Schedules

| Cadence (UTC) | Path | Purpose |
|---------------|------|---------|
| Every 15 min (`*/15 * * * *`) | `/api/cron/wallet-rewards` | Process pending wallet / loyalty completion rewards (batch 80) |
| Every 15 min (`*/15 * * * *`) | `/api/cron/booking-reminders` | Wallet rewards (batch 40) + reserved hooks for future non-SMS consumer notices (currently no-op for SMS) |

Auth: [`src/lib/env/cron-auth.ts`](../src/lib/env/cron-auth.ts).

## VPS crontab (with CRM on same host)

PM2 does **not** schedule jobs. Use system crontab. Prefer localhost:

```bash
# Append to /etc/glamzzo-cron.env (shared with CRM)
echo 'WEB_BASE_URL=http://127.0.0.1:4008' | sudo tee -a /etc/glamzzo-cron.env
```

Add to the deploy user’s crontab (`crontab -e`):

```cron
CRON_TZ=UTC
SHELL=/bin/bash
BASH_ENV=/etc/glamzzo-cron.env

# --- Glammzo-web ---
*/15 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" "$WEB_BASE_URL/api/cron/wallet-rewards" >> /var/log/glamzzo-cron.log 2>&1
*/15 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" "$WEB_BASE_URL/api/cron/booking-reminders" >> /var/log/glamzzo-cron.log 2>&1
```

Manual verify:

```bash
. /etc/glamzzo-cron.env
curl -fsS -H "Authorization: Bearer $CRON_SECRET" "$WEB_BASE_URL/api/cron/wallet-rewards"
curl -fsS -H "Authorization: Bearer $CRON_SECRET" "$WEB_BASE_URL/api/cron/booking-reminders"
```

Expect JSON with `"ok":true` (not `401`).

## Local

Default secret when unset: `glamzzo-dev-cron-secret`. Web `npm start` uses port **4008**.

```bash
curl -fsS -H "Authorization: Bearer glamzzo-dev-cron-secret" \
  "http://127.0.0.1:4008/api/cron/wallet-rewards"
```

## Related

CRM jobs (subscription expiry, expired web bookings, WA reminders, wallet payout notify): see glamzzo-crm `docs/CRON_JOBS.md`.
