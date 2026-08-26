import { api } from './api'

export interface SubscriptionStatus {
  status: 'none' | 'active' | 'inactive' | 'canceled' | 'expired' | 'paused' | 'trial'
  subscription: {
    id: string
    cakto_subscription_id: string | null
    amount: number
    next_payment_date: string | null
    current_period: number
    payment_method: string
    created_at: string
  } | null
}

export interface CheckoutResponse {
  checkoutUrl: string | null
  pix: {
    qrCode: string
    qrCodeBase64: string
    expirationDate: string
  } | null
  orderId: string
  status: string
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    return await api.get<SubscriptionStatus>('/subscriptions/status')
  } catch {
    return { status: 'none', subscription: null }
  }
}

export async function createCheckout(
  offerId: string,
  paymentMethod: string,
  customer: { name: string; email: string; phone: string; doc: string }
): Promise<CheckoutResponse> {
  return api.post<CheckoutResponse>('/subscriptions/checkout', {
    offerId,
    paymentMethod,
    ...customer,
  })
}

export async function cancelSubscription(): Promise<{ success: boolean }> {
  return api.post('/subscriptions/cancel', {})
}
