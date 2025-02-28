declare class Razorpay {
  constructor(options: RazorpayOptions)
  open(): void
  close(): void
}

interface RazorpayOptions {
  key_id: string
  amount: number
  currency: string
  name: string
  description: string
  image?: string
  order_id?: string
  handler(response: {
    razorpay_payment_id: string
    razorpay_order_id?: string
    razorpay_signature?: string
  }): void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: { [key: string]: any }
  theme?: {
    color?: string
  }
}
