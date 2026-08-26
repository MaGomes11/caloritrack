import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getMealsByDate, deleteMeal } from '../services/meals'
import type { Meal } from '../services/meals'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export function DiaryPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  const dateStr = selectedDate.toISOString().split('T')[0]

  useEffect(() => {
    loadMeals()
  }, [dateStr])

  async function loadMeals() {
    setLoading(true)
    const data = await getMealsByDate(dateStr)
    setMeals(data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const success = await deleteMeal(id)
    if (success) {
      setMeals(meals.filter((m) => m.id !== id))
    }
  }

  function changeDate(offset: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + offset)
    setSelectedDate(d)
  }

  function buildCalendarDays() {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0)
  const calendarDays = buildCalendarDays()
  const isToday = dateStr === new Date().toISOString().split('T')[0]
  const isFuture = selectedDate > new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Diário</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => changeDate(-1)} className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronLeft size={18} />
            </button>
            <p className="text-sm font-medium text-gray-900">
              {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </p>
            <button onClick={() => changeDate(1)} className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] text-gray-400 font-medium">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />
              const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
              const dStr = d.toISOString().split('T')[0]
              const isSelected = dStr === dateStr
              const isTodayCell = dStr === new Date().toISOString().split('T')[0]

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(d)}
                  className={`h-8 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-emerald-500 text-white'
                      : isTodayCell
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isToday ? 'Hoje' : `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`}
            </p>
            <p className="text-xs text-gray-400">
              {totalCalories} / {profile?.daily_calories ?? 2000} kcal
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{meals.length}</p>
            <p className="text-xs text-gray-400">refeições</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
        ) : meals.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            {isFuture ? 'Sem refeições no futuro.' : 'Nenhuma refeição neste dia.'}
          </div>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
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
                  {!isFuture && (
                    <button onClick={() => handleDelete(meal.id)} className="p-1 text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
