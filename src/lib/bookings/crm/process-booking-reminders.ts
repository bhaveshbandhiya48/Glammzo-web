import "server-only"

/**
 * Consumer SMS booking reminders are intentionally disabled for launch.
 * CRM WhatsApp (T-1h + booking lifecycle) is the messaging channel.
 * Keep this export so cron / lazy hooks stay stable without MSG91 non-OTP templates.
 */
export async function processConsumerBookingReminders(): Promise<number> {
  return 0
}
