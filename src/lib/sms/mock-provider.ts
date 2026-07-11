import type { SendSmsInput, SendSmsResult, SmsProvider } from "@/lib/sms/types"

export class MockSmsProvider implements SmsProvider {
  readonly name = "mock"

  async sendSms(input: SendSmsInput): Promise<SendSmsResult> {
    if (!input.body.trim()) {
      return { success: false, error: "Message body is required." }
    }

    if (process.env.NODE_ENV !== "production" || process.env.SMS_PROVIDER === "mock") {
      console.info("[sms:mock] OTP to", input.to, ":", input.body)
    }

    return { success: true, externalId: `mock_${crypto.randomUUID()}` }
  }
}

export const mockSmsProvider = new MockSmsProvider()
