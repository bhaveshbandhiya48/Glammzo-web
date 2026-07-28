import { getActiveSmsProvider } from "@/lib/sms"

/**
 * Returns a fixed OTP when mock SMS is active and SMS_FIXED_OTP is a 6-digit code.
 * Otherwise returns a random 6-digit OTP.
 *
 * Never falls back to a hardcoded code — SMS_FIXED_OTP must be set explicitly.
 */
export function resolveOtpCode(): string {
  const fixed = process.env.SMS_FIXED_OTP?.trim() ?? ""
  const provider = getActiveSmsProvider().name

  if (provider === "mock" && /^\d{6}$/.test(fixed)) {
    return fixed
  }

  return String(Math.floor(100000 + Math.random() * 900000))
}
