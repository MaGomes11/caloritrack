import { useState } from 'react'
import { Shield, Check, CreditCard, QrCode, Copy, CheckCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { createCheckout } from '../services/subscriptions'

const CAKTO_OFFER_ID = import.meta.env.VITE_CAKTO_OFFER_ID || ''

export function PricingPage() {
  const { profile, refreshProfile } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'pix_auto' | 'boleto'>('pix')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string; expirationDate: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCheckout() {
    if (!CAKTO_OFFER_ID) {
      setError('ID da oferta não configurado. Defina VITE_CAKTO_OFFER_ID no .env')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await createCheckout(
        CAKTO_OFFER_ID,
        paymentMethod,
        {
          name: profile?.name || '',
          email: profile?.email || '',
          phone: '',
          doc: '',
        }
      )

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
        return
      }

      if (result.pix) {
        setPixData(result.pix)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar checkout')
    }
    setLoading(false)
  }

  function copyPix() {
    if (!pixData) return
    navigator.clipboard.writeText(pixData.qrCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (pixData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pague com Pix</h2>
          <p className="text-sm text-gray-500 mb-6">Escaneie o QR Code ou copie o código abaixo</p>

          {pixData.qrCodeBase64 && (
            <div className="mb-4">
              <img src={pixData.qrCodeBase64} alt="QR Code Pix" className="mx-auto w-56 h-56" />
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-gray-400 mb-1">Código Pix copia e cola</p>
            <p className="text-xs text-gray-600 break-all font-mono">{pixData.qrCode}</p>
          </div>

          <button
            onClick={copyPix}
            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 mb-3"
          >
            {copied ? <CheckCheck size={18} /> : <Copy size={18} />}
            {copied ? 'Copiado!' : 'Copiar código Pix'}
          </button>

          <p className="text-xs text-gray-400">
            Expira em: {new Date(pixData.expirationDate).toLocaleString('pt-BR')}
          </p>

          <button
            onClick={() => { setPixData(null); refreshProfile() }}
            className="mt-4 text-sm text-emerald-500 font-medium hover:text-emerald-600"
          >
            Já paguei →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">CaloriTrack Premium</h1>
          <p className="text-gray-500 text-sm mt-2">Acesso completo ao app de contagem de calorias</p>
        </div>

        {/* Plan */}
        <div className="bg-emerald-50 rounded-xl p-6 mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-emerald-600">R$ 19,90</span>
            <span className="text-sm text-emerald-500">/mês</span>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {[
            'Registro ilimitado de refeições',
            'Banco de alimentos completo',
            'Gráficos de progresso detalhados',
            'Histórico e diário completo',
            'Tipos de refeição personalizados',
            'Suporte prioritário',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <Check size={16} className="text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Forma de pagamento</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMethod('pix')}
              className={`py-3 rounded-xl border text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                paymentMethod === 'pix'
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <QrCode size={16} />
              Pix
            </button>
            <button
              onClick={() => setPaymentMethod('pix_auto')}
              className={`py-3 rounded-xl border text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                paymentMethod === 'pix_auto'
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <QrCode size={16} />
              Pix Auto
            </button>
            <button
              onClick={() => setPaymentMethod('boleto')}
              className={`py-3 rounded-xl border text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                paymentMethod === 'boleto'
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard size={16} />
              Boleto
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Assinar agora'}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Cancele quando quiser. Sem compromisso.
        </p>
      </div>
    </div>
  )
}
