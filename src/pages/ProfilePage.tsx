import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, LogOut, UtensilsCrossed, Crown, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile } from '../services/profile'
import { cancelSubscription } from '../services/subscriptions'
import { calculateTMB, calculateDailyCalories } from '../utils/calculations'

export function ProfilePage() {
  const { profile, subscription, refreshProfile, refreshSubscription, logout } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(profile?.name ?? '')
  const [weight, setWeight] = useState(String(profile?.weight ?? ''))
  const [height, setHeight] = useState(String(profile?.height ?? ''))
  const [age, setAge] = useState(String(profile?.age ?? ''))
  const [sex, setSex] = useState<'M' | 'F'>(profile?.sex ?? 'M')
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>(profile?.goal ?? 'maintain')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cancelingSub, setCancelingSub] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const previewTMB = calculateTMB(Number(weight), Number(height), Number(age), sex)
  const previewCalories = calculateDailyCalories(previewTMB, goal)

  async function handleSave() {
    setSaving(true)
    const dailyCalories = calculateDailyCalories(previewTMB, goal)
    await updateProfile({
      name,
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      sex,
      goal,
      daily_calories: dailyCalories,
      onboarding_done: true,
    })
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleCancelSubscription() {
    setCancelingSub(true)
    try {
      await cancelSubscription()
      await refreshSubscription()
      setConfirmCancel(false)
    } catch {
      alert('Erro ao cancelar assinatura')
    }
    setCancelingSub(false)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Perfil</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Dados pessoais</h3>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Peso (kg)</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Altura (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Idade</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sexo</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSex('M')} className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition-colors ${sex === 'M' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200'}`}>Homem</button>
                <button type="button" onClick={() => setSex('F')} className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition-colors ${sex === 'F' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200'}`}>Mulher</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Objetivo</h3>
          <div className="flex gap-2">
            {([
              { value: 'lose', label: 'Perder peso' },
              { value: 'maintain', label: 'Manter' },
              { value: 'gain', label: 'Ganhar massa' },
            ] as const).map((opt) => (
              <button key={opt.value} type="button" onClick={() => setGoal(opt.value)} className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition-colors ${goal === opt.value ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Cálculos</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{Math.round(previewTMB)}</p>
              <p className="text-[10px] text-gray-400">Taxa Metabólica Basal</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-emerald-600">{previewCalories}</p>
              <p className="text-[10px] text-gray-400">Meta diária</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-400">TMB calculada pela fórmula de Harris-Benedict. Meta baseada no objetivo e fator de atividade leve.</p>
        </div>

        <button onClick={() => navigate('/meal-types')} className="w-full py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-100 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <UtensilsCrossed size={18} />
          Gerenciar tipos de refeição
        </button>

        {/* Subscription Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Crown size={16} className="text-emerald-500" />
            Assinatura
          </h3>
          {subscription?.status === 'active' && subscription.subscription ? (
            <div className="space-y-3">
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-sm font-medium text-emerald-700">Plano Premium Ativo</p>
                <p className="text-xs text-emerald-600 mt-1">
                  R$ {subscription.subscription.amount.toFixed(2).replace('.', ',')}/mês
                </p>
                {subscription.subscription.next_payment_date && (
                  <p className="text-xs text-emerald-500 mt-1">
                    Próximo pagamento: {new Date(subscription.subscription.next_payment_date).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              {!confirmCancel ? (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="w-full py-2.5 bg-white text-red-500 rounded-xl font-medium border border-red-200 hover:bg-red-50 transition-colors text-sm"
                >
                  Cancelar assinatura
                </button>
              ) : (
                <div className="bg-red-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600">
                      Tem certeza? Você perderá acesso ao app ao final do período cobrado.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmCancel(false)}
                      className="flex-1 py-2 bg-white text-gray-600 rounded-lg border border-gray-200 text-xs"
                    >
                      Manter
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelingSub}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs disabled:opacity-50"
                    >
                      {cancelingSub ? 'Cancelando...' : 'Sim, cancelar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Você não possui uma assinatura ativa.</p>
              <button
                onClick={() => navigate('/pricing')}
                className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors text-sm"
              >
                Assinar Premium
              </button>
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          <Save size={18} />
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar alterações'}
        </button>

        <button onClick={handleLogout} className="w-full py-3 bg-white text-red-500 rounded-xl font-medium border border-gray-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
          <LogOut size={18} />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
