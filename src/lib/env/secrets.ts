export function assertProductionSecretsConfigured() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing: string[] = [];

  if (!process.env.AUTH_SECRET?.trim()) missing.push("AUTH_SECRET");
  if (!process.env.CRON_SECRET?.trim()) missing.push("CRON_SECRET");

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`,
    );
  }

  const provider = process.env.SMS_PROVIDER?.trim();
  const hasTwilio = provider === "twilio" || Boolean(process.env.TWILIO_ACCOUNT_SID?.trim());

  if (!hasTwilio) {
    console.warn(
      "[env] SMS is using the mock provider in production. For staging, set SMS_FIXED_OTP=123456 (and optionally SMS_DEBUG_OTP=true). For go-live SMS, set SMS_PROVIDER=twilio and Twilio credentials; unset SMS_FIXED_OTP.",
    );
  }
}
