import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Plus, Trash2, X } from 'lucide-react'
import { getFoods, searchFoods, createFood, deleteFood } from '../services/foods'
import type { Food } from '../services/foods'

export function FoodListPage() {
  const navigate = useNavigate()
  const [foods, setFoods] = useState<Food[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCalories, setNewCalories] = useState('')
  const [newProtein, setNewProtein] = useState('0')
  const [newCarbs, setNewCarbs] = useState('0')
  const [newFat, setNewFat] = useState('0')

  useEffect(() => {
    loadFoods()
  }, [])

  async function loadFoods() {
    setLoading(true)
    const data = await getFoods()
    setFoods(data)
    setLoading(false)
  }

  async function handleSearch(value: string) {
    setQuery(value)
    if (value.length < 1) {
      loadFoods()
      return
    }
    const data = await searchFoods(value)
    setFoods(data)
  }

  async function handleAdd() {
    if (!newName || !newCalories) return
    const food = await createFood({
      name: newName,
      calories: Number(newCalories),
      protein: Number(newProtein),
      carbs: Number(newCarbs),
      fat: Number(newFat),
    })
    if (food) {
      setFoods([food, ...foods])
      setShowAdd(false)
      setNewName('')
      setNewCalories('')
      setNewProtein('0')
      setNewCarbs('0')
      setNewFat('0')
    }
  }

  async function handleDelete(id: string) {
    const success = await deleteFood(id)
    if (success) {
      setFoods(foods.filter((f) => f.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 flex-1">Alimentos</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="text-emerald-500">
          {showAdd ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            placeholder="Buscar alimento..."
          />
        </div>

        {showAdd && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Novo alimento</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="Nome do alimento"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Calorias / 100g</label>
                <input
                  type="number"
                  value={newCalories}
                  onChange={(e) => setNewCalories(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Proteína (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newProtein}
                  onChange={(e) => setNewProtein(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Carboidratos (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newCarbs}
                  onChange={(e) => setNewCarbs(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Gordura (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newFat}
                  onChange={(e) => setNewFat(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!newName || !newCalories}
              className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
        ) : foods.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Nenhum alimento encontrado.</div>
        ) : (
          <div className="space-y-2">
            {foods.map((food) => (
              <div key={food.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm">{food.name}</p>
                    {food.is_default && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">padrão</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {food.calories} kcal · P {food.protein}g · C {food.carbs}g · G {food.fat}g
                  </p>
                </div>
                {!food.is_default && (
                  <button onClick={() => handleDelete(food.id)} className="p-2 text-gray-300 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
