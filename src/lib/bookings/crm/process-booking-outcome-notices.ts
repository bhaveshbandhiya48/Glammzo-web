import "server-only"

/**
 * Consumer SMS outcome notices (expired / declined) are intentionally disabled.
 * CRM WhatsApp covers customer messaging when entitled.
 */
export async function processConsumerBookingOutcomeNotices(): Promise<number> {
  return 0
}
