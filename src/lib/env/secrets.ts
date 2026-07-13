export function assertProductionSecretsConfigured() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing: string[] = [];

  if (!process.env.AUTH_SECRET?.trim()) missing.push("AUTH_SECRET");
  if (!process.env.CRON_SECRET?.trim()) missing.push("CRON_SECRET");

  if (process.env.SMS_PROVIDER === "mock") {
    throw new Error(
      "SMS_PROVIDER=mock is not allowed in production. Set SMS_PROVIDER=twilio and configure Twilio credentials.",
    );
  }

  const hasTwilio =
    process.env.SMS_PROVIDER === "twilio" || Boolean(process.env.TWILIO_ACCOUNT_SID?.trim());

  if (!hasTwilio) {
    missing.push("SMS_PROVIDER=twilio + TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_SMS_FROM");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`,
    );
  }
}
