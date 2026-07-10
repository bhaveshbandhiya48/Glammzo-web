import type { SendSmsInput, SendSmsResult, SmsProvider } from "@/lib/sms/types"

function toE164(phone: string) {
  const digits = phone.replace(/\D/g, "")
  if (phone.startsWith("+")) return phone
  if (digits.length === 10) return `+91${digits}`
  if (digits.startsWith("91")) return `+${digits}`
  return `+${digits}`
}

export class TwilioSmsProvider implements SmsProvider {
  readonly name = "twilio"

  async sendSms(input: SendSmsInput): Promise<SendSmsResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_SMS_FROM

    if (!accountSid || !authToken || !from) {
      return { success: false, error: "Twilio SMS is not configured." }
    }

    const body = new URLSearchParams({
      To: toE164(input.to),
      From: from,
      Body: input.body,
    })

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    )

    if (!response.ok) {
      const text = await response.text()
      console.error("[sms:twilio] send failed:", text)
      return { success: false, error: "Could not send SMS." }
    }

    const payload = (await response.json()) as { sid?: string }
    return { success: true, externalId: payload.sid }
  }
}

export const twilioSmsProvider = new TwilioSmsProvider()
