export function getCronSecret(): string | null {
  const value = process.env.CRON_SECRET?.trim();
  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return "glamzzo-dev-cron-secret";
}

export function isCronRequestAuthorized(request: Request): boolean {
  const secret = getCronSecret();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[cron] CRON_SECRET is not configured");
    }
    return process.env.NODE_ENV !== "production";
  }

  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}
