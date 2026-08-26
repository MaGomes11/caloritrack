import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signUp, login } from '../services/auth'
import { updateProfile } from '../services/profile'
import { calculateTMB, calculateDailyCalories } from '../utils/calculations'
import { useAuth } from '../contexts/AuthContext'

type Step = 'login' | 'signup' | 'onboarding'

export function AuthPage() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [step, setStep] = useState<Step>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<'M' | 'F'>('M')
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      await refreshProfile()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signUp(email, password)
      setStep('onboarding')
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  async function handleOnboarding(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const tmb = calculateTMB(Number(weight), Number(height), Number(age), sex)
    const dailyCalories = calculateDailyCalories(tmb, goal)

    const result = await updateProfile({
      name,
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      sex,
      goal,
      daily_calories: dailyCalories,
      onboarding_done: true,
    })

    if (!result) {
      setError('Erro ao salvar perfil')
      setLoading(false)
      return
    }

    await refreshProfile()
    navigate('/dashboard')
  }

  if (step === 'onboarding') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Quase lá!</h1>
          <p className="text-gray-500 mb-6">Conte-nos sobre você para calcular sua meta.</p>

          <form onSubmit={handleOnboarding} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Seu nome"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                <input
                  type="number"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="175"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSex('M')}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      sex === 'M'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Homem
                  </button>
                  <button
                    type="button"
                    onClick={() => setSex('F')}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      sex === 'F'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Mulher
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
              <div className="flex gap-2">
                {([
                  { value: 'lose', label: 'Perder peso' },
                  { value: 'maintain', label: 'Manter' },
                  { value: 'gain', label: 'Ganhar massa' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGoal(opt.value)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      goal === opt.value
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Calculando...' : 'Começar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔥</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">CaloriTrack</h1>
          <p className="text-gray-500 text-sm mt-1">Controle suas calorias com simplicidade</p>
        </div>

        <form onSubmit={step === 'login' ? handleLogin : handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Sua senha"
              minLength={6}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Carregando...' : step === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {step === 'login' ? (
            <>
              Não tem conta?{' '}
              <button onClick={() => { setStep('signup'); setError('') }} className="text-emerald-500 font-medium hover:text-emerald-600">
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button onClick={() => { setStep('login'); setError('') }} className="text-emerald-500 font-medium hover:text-emerald-600">
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
