import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { getMealsRange } from '../services/meals'

type Period = '7d' | '30d' | '90d'

interface DayData {
  date: string
  label: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export function ProgressPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('7d')
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [period])

  async function loadData() {
    setLoading(true)
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)

    const fromDate = from.toISOString().split('T')[0]
    const toDate = to.toISOString().split('T')[0]
    const meals = await getMealsRange(fromDate, toDate)

    const dayMap = new Map<string, DayData>()
    for (let i = 0; i < days; i++) {
      const d = new Date(from)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split('T')[0]
      dayMap.set(key, { date: key, label: `${d.getDate()}/${d.getMonth() + 1}`, calories: 0, protein: 0, carbs: 0, fat: 0 })
    }

    meals.forEach((meal) => {
      const entry = dayMap.get(meal.date)
      if (entry) {
        entry.calories += meal.calories
        entry.protein += meal.protein
        entry.carbs += meal.carbs
        entry.fat += meal.fat
      }
    })

    setData(Array.from(dayMap.values()))
    setLoading(false)
  }

  const dailyTarget = profile?.daily_calories ?? 2000
  const daysWithMeals = data.filter((d) => d.calories > 0)
  const avgCalories = daysWithMeals.length
    ? Math.round(daysWithMeals.reduce((s, d) => s + d.calories, 0) / daysWithMeals.length)
    : 0
  const daysOnTarget = daysWithMeals.filter((d) => d.calories <= dailyTarget).length
  const hitRate = daysWithMeals.length ? Math.round((daysOnTarget / daysWithMeals.length) * 100) : 0
  const trend = data.length >= 2 ? data[data.length - 1].calories - data[0].calories : 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Progresso</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex bg-white rounded-xl border border-gray-100 p-1">
          {([
            { value: '7d', label: '7 dias' },
            { value: '30d', label: '30 dias' },
            { value: '90d', label: '90 dias' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                period === opt.value ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{avgCalories}</p>
            <p className="text-[10px] text-gray-400">Média kcal</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{hitRate}%</p>
            <p className="text-[10px] text-gray-400">Dias na meta</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center flex flex-col items-center">
            {trend > 50 ? <TrendingUp size={18} className="text-red-400" /> : trend < -50 ? <TrendingDown size={18} className="text-emerald-400" /> : <Minus size={18} className="text-gray-400" />}
            <p className="text-[10px] text-gray-400 mt-1">Tendência</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Calorias por dia</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} formatter={(value: any) => [`${value} kcal`, 'Calorias']} />
                <ReferenceLine y={dailyTarget} stroke="#d1d5db" strokeDasharray="4 4" label={{ value: 'Meta', fontSize: 10, fill: '#9ca3af' }} />
                <Area type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCalories)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Macros por dia</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} formatter={(value: any, name: any) => {
                  const labels: Record<string, string> = { protein: 'Proteína', carbs: 'Carboidratos', fat: 'Gordura' }
                  return [`${Math.round(Number(value))}g`, labels[name] ?? name]
                }} />
                <Area type="monotone" dataKey="protein" stroke="#3b82f6" strokeWidth={1.5} fill="none" />
                <Area type="monotone" dataKey="carbs" stroke="#f59e0b" strokeWidth={1.5} fill="none" />
                <Area type="monotone" dataKey="fat" stroke="#ef4444" strokeWidth={1.5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[10px] text-gray-400">Proteína</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[10px] text-gray-400">Carboidratos</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[10px] text-gray-400">Gordura</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
