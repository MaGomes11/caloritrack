import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Plus, BookOpen, BarChart3, CalendarDays, Home, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getMealsByDate, deleteMeal } from '../services/meals'
import type { Meal } from '../services/meals'

export function DashboardPage() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [todayMeals, setTodayMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function fetchMeals() {
      const data = await getMealsByDate(today)
      setTodayMeals(data)
      setLoading(false)
    }
    fetchMeals()
    refreshProfile()
  }, [today])

  async function handleDeleteMeal(id: string) {
    const success = await deleteMeal(id)
    if (success) {
      setTodayMeals(todayMeals.filter((m) => m.id !== id))
    }
  }

  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0)
  const totalProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0)
  const totalCarbs = todayMeals.reduce((sum, m) => sum + m.carbs, 0)
  const totalFat = todayMeals.reduce((sum, m) => sum + m.fat, 0)
  const remaining = (profile?.daily_calories ?? 2000) - totalCalories
  const progress = profile ? Math.min((totalCalories / profile.daily_calories) * 100, 100) : 0

  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (progress / 100) * circumference

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Bem-vindo,</p>
          <h1 className="text-lg font-semibold text-gray-900">{profile?.name ?? 'Usuário'}</h1>
        </div>
        <button onClick={() => navigate('/profile')} className="p-2 text-gray-400 hover:text-gray-600">
          <Settings size={20} />
        </button>
      </div>

      {/* Calorie Ring */}
      <div className="px-4 py-8 flex flex-col items-center">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#f0fdf4" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#10b981"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{Math.max(remaining, 0)}</span>
            <span className="text-xs text-gray-400">restantes</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {totalCalories} / {profile?.daily_calories ?? 2000} kcal
          </p>
        </div>

        {/* Macros */}
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{Math.round(totalProtein)}g</p>
            <p className="text-xs text-gray-400">Proteína</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{Math.round(totalCarbs)}g</p>
            <p className="text-xs text-gray-400">Carboidratos</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{Math.round(totalFat)}g</p>
            <p className="text-xs text-gray-400">Gorduras</p>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/add-meal')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors flex items-center justify-center z-10"
      >
        <Plus size={24} />
      </button>

      {/* Today's Meals */}
      <div className="px-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Hoje</h2>
        {todayMeals.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Nenhuma refeição registrada hoje.
          </div>
        ) : (
          <div className="space-y-2">
            {todayMeals.map((meal) => (
              <div key={meal.id} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{meal.food_name}</p>
                    <p className="text-xs text-gray-400">
                      {meal.meal_type} · {meal.quantity}g
                    </p>
                  </div>
                  <div className="text-right mr-2">
                    <p className="font-semibold text-gray-900">{meal.calories} kcal</p>
                    <p className="text-xs text-gray-400">
                      P {Math.round(meal.protein)}g · C {Math.round(meal.carbs)}g · G {Math.round(meal.fat)}g
                    </p>
                  </div>
                  <button onClick={() => handleDeleteMeal(meal.id)} className="p-1 text-gray-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 flex justify-around">
        <button className="flex flex-col items-center gap-1 text-emerald-500">
          <Home size={20} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button onClick={() => navigate('/diary')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
          <CalendarDays size={20} />
          <span className="text-[10px] font-medium">Diário</span>
        </button>
        <button onClick={() => navigate('/food-list')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
          <BookOpen size={20} />
          <span className="text-[10px] font-medium">Alimentos</span>
        </button>
        <button onClick={() => navigate('/progress')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
          <BarChart3 size={20} />
          <span className="text-[10px] font-medium">Progresso</span>
        </button>
      </nav>
    </div>
  )
}
