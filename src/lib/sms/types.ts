export type SendSmsInput = {
  to: string
  body: string
}

export type SendSmsResult =
  | { success: true; externalId?: string }
  | { success: false; error: string }

export type SmsProvider = {
  readonly name: string
  sendSms(input: SendSmsInput): Promise<SendSmsResult>
}
