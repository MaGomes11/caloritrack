import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Plus } from 'lucide-react'
import { searchFoods } from '../services/foods'
import { createMeal } from '../services/meals'
import { getMealTypes } from '../services/mealTypes'
import type { Food } from '../services/foods'
import type { MealType } from '../services/mealTypes'

export function AddMealPage() {
  const navigate = useNavigate()

  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState('100')
  const [mealType, setMealType] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCalories, setCustomCalories] = useState('')
  const [customProtein, setCustomProtein] = useState('0')
  const [customCarbs, setCustomCarbs] = useState('0')
  const [customFat, setCustomFat] = useState('0')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMealTypes().then((types) => {
      setMealTypes(types)
      if (types.length > 0 && !mealType) setMealType(types[0].name)
    })
  }, [])

  let searchTimeout: ReturnType<typeof setTimeout>

  function handleSearch(value: string) {
    setQuery(value)
    clearTimeout(searchTimeout)
    if (value.length < 1) {
      setResults([])
      return
    }
    searchTimeout = setTimeout(async () => {
      const foods = await searchFoods(value)
      setResults(foods)
    }, 300)
  }

  function handleSelectFood(food: Food) {
    setSelectedFood(food)
    setQuery(food.name)
    setResults([])
    setShowCustom(false)
  }

  function calcCalories(food: Food, qty: number) {
    const ratio = qty / 100
    return {
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
    }
  }

  async function handleSave() {
    setSaving(true)

    const qty = Number(quantity)
    const today = new Date().toISOString().split('T')[0]

    let mealData

    if (showCustom) {
      mealData = {
        food_id: 'custom',
        food_name: customName,
        meal_type: mealType,
        quantity: qty,
        calories: Math.round(Number(customCalories) * qty / 100),
        protein: Number(customProtein) * qty / 100,
        carbs: Number(customCarbs) * qty / 100,
        fat: Number(customFat) * qty / 100,
        date: today,
      }
    } else if (selectedFood) {
      const macros = calcCalories(selectedFood, qty)
      mealData = {
        food_id: selectedFood.id,
        food_name: selectedFood.name,
        meal_type: mealType,
        quantity: qty,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        date: today,
      }
    } else {
      setSaving(false)
      return
    }

    const result = await createMeal(mealData as any)
    if (result) navigate('/dashboard')
    setSaving(false)
  }

  const preview = selectedFood ? calcCalories(selectedFood, Number(quantity)) : null
  const customPreview = showCustom && customCalories
    ? {
        calories: Math.round(Number(customCalories) * Number(quantity) / 100),
        protein: Math.round(Number(customProtein) * Number(quantity) / 100 * 10) / 10,
        carbs: Math.round(Number(customCarbs) * Number(quantity) / 100 * 10) / 10,
        fat: Math.round(Number(customFat) * Number(quantity) / 100 * 10) / 10,
      }
    : null

  const cols = mealTypes.length <= 4 ? 4 : mealTypes.length <= 6 ? 3 : 2

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Adicionar Refeição</h1>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de refeição</label>
          <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {mealTypes.map((mt) => (
              <button
                key={mt.id}
                onClick={() => setMealType(mt.name)}
                className={`py-2 px-1 rounded-xl border text-xs font-medium transition-colors ${
                  mealType === mt.name
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {mt.name}
              </button>
            ))}
          </div>
        </div>

        {!showCustom && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar alimento</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                placeholder="Ex: arroz, frango, banana..."
              />
            </div>

            {results.length > 0 && (
              <div className="mt-2 bg-white rounded-xl border border-gray-100 max-h-48 overflow-y-auto">
                {results.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                  >
                    <p className="text-sm font-medium text-gray-900">{food.name}</p>
                    <p className="text-xs text-gray-400">{food.calories} kcal · P {food.protein}g · C {food.carbs}g · G {food.fat}g</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => { setShowCustom(!showCustom); setSelectedFood(null); setQuery('') }}
          className="flex items-center gap-2 text-sm text-emerald-500 font-medium"
        >
          <Plus size={16} />
          {showCustom ? 'Buscar alimento existente' : 'Adicionar alimento personalizado'}
        </button>

        {showCustom && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Nome do alimento" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Calorias (por 100g)</label>
                <input type="number" value={customCalories} onChange={(e) => setCustomCalories(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Proteína (g/100g)</label>
                <input type="number" step="0.1" value={customProtein} onChange={(e) => setCustomProtein(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Carboidratos (g/100g)</label>
                <input type="number" step="0.1" value={customCarbs} onChange={(e) => setCustomCarbs(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Gordura (g/100g)</label>
                <input type="number" step="0.1" value={customFat} onChange={(e) => setCustomFat(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
            </div>
          </div>
        )}

        {(selectedFood || showCustom) && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade (g)</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" min="1" />
            </div>
            {(preview || customPreview) && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-medium text-gray-900 mb-1">Resumo</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Calorias</span>
                  <span className="font-semibold text-gray-900">{preview?.calories ?? customPreview?.calories} kcal</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>P {preview?.protein ?? customPreview?.protein}g</span>
                  <span>C {preview?.carbs ?? customPreview?.carbs}g</span>
                  <span>G {preview?.fat ?? customPreview?.fat}g</span>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || (!selectedFood && !showCustom) || (showCustom && !customName)}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Refeição'}
        </button>
      </div>
    </div>
  )
}
