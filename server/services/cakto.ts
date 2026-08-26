const CAKTO_BASE = 'https://api.cakto.com.br/public_api'

let cachedToken: string | null = null
let tokenExpiresAt = 0

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken
  }

  const clientId = process.env.CAKTO_CLIENT_ID!
  const clientSecret = process.env.CAKTO_CLIENT_SECRET!

  const res = await fetch(`${CAKTO_BASE}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) {
    throw new Error('Falha ao autenticar com Cakto')
  }

  const data = await res.json()
  cachedToken = data.access_token
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000
  return cachedToken!
}

async function caktoRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken()
  const res = await fetch(`${CAKTO_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || `Erro Cakto: ${res.status}`)
  }

  return res.json() as Promise<T>
}

export interface CreatePaymentParams {
  offerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerDoc?: string
  paymentMethod: 'pix' | 'pix_auto' | 'boleto' | 'credit_card'
}

export interface CaktoPaymentResponse {
  id: string
  refId: string
  status: string
  paymentMethod: string
  amount: string
  checkoutUrl: string | null
  pix?: {
    qrCode: string
    qrCodeBase64: string
    expirationDate: string
  }
  product?: { id: string; name: string }
  offer?: { id: string; name: string; price: number }
}

export async function createPayment(params: CreatePaymentParams): Promise<CaktoPaymentResponse> {
  return caktoRequest<CaktoPaymentResponse>('/payments/', {
    method: 'POST',
    body: JSON.stringify({
      items: [{ offerId: params.offerId, quantity: 1, offerType: 'main' }],
      customer: {
        name: params.customerName,
        email: params.customerEmail,
        phone: params.customerPhone,
        fingerprint: params.customerEmail,
        docType: 'cpf',
        docNumber: params.customerDoc || '',
      },
      paymentMethod: params.paymentMethod,
    }),
  })
}

export interface CaktoSubscription {
  id: string
  status: string
  amount: string
  current_period: number
  next_payment_date: string | null
  paymentMethod: any
  customer: any
  product: any
  offer: any
}

export async function getSubscription(caktoSubId: string): Promise<CaktoSubscription> {
  return caktoRequest<CaktoSubscription>(`/subscriptions/${caktoSubId}/`)
}

export async function cancelSubscription(caktoSubId: string): Promise<CaktoSubscription> {
  return caktoRequest<CaktoSubscription>(`/subscriptions/${caktoSubId}/cancel/`, {
    method: 'POST',
  })
}

export async function pauseSubscription(caktoSubId: string): Promise<CaktoSubscription> {
  return caktoRequest<CaktoSubscription>(`/subscriptions/${caktoSubId}/pause/`, {
    method: 'POST',
  })
}

export async function resumeSubscription(caktoSubId: string): Promise<CaktoSubscription> {
  return caktoRequest<CaktoSubscription>(`/subscriptions/${caktoSubId}/resume/`, {
    method: 'POST',
  })
}
