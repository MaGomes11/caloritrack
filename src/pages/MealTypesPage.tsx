import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { getMealTypes, createMealType, updateMealType, deleteMealType } from '../services/mealTypes'
import type { MealType } from '../services/mealTypes'

export function MealTypesPage() {
  const navigate = useNavigate()
  const [mealTypes, setMealTypes] = useState<MealType[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadTypes()
  }, [])

  async function loadTypes() {
    setLoading(true)
    const data = await getMealTypes()
    setMealTypes(data)
    setLoading(false)
  }

  async function handleAdd() {
    if (!newName.trim()) return
    setError('')
    const result = await createMealType(newName.trim())
    if (result) {
      setMealTypes([...mealTypes, result])
      setNewName('')
    } else {
      setError('Erro ao criar tipo')
    }
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim()) return
    setError('')
    const result = await updateMealType(id, editingName.trim())
    if (result) {
      setMealTypes(mealTypes.map((mt) => (mt.id === id ? result : mt)))
      setEditingId(null)
      setEditingName('')
    } else {
      setError('Erro ao atualizar tipo')
    }
  }

  async function handleDelete(id: string) {
    setError('')
    const result = await deleteMealType(id)
    if (result.success) {
      setMealTypes(mealTypes.filter((mt) => mt.id !== id))
    } else {
      setError(result.error || 'Erro ao excluir tipo')
    }
  }

  function startEdit(mt: MealType) {
    setEditingId(mt.id)
    setEditingName(mt.name)
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingName('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Tipos de Refeição</h1>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-500">Gerencie os tipos de refeição disponíveis ao registrar suas refeições.</p>

        {/* Add new */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            placeholder="Novo tipo (ex: Pré-treino)"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <Plus size={18} />
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
        ) : mealTypes.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Nenhum tipo cadastrado.</div>
        ) : (
          <div className="space-y-2">
            {mealTypes.map((mt) => (
              <div key={mt.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-2">
                {editingId === mt.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(mt.id)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      autoFocus
                    />
                    <button onClick={() => handleUpdate(mt.id)} className="p-2 text-emerald-500 hover:text-emerald-600">
                      <Check size={16} />
                    </button>
                    <button onClick={cancelEdit} className="p-2 text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-gray-900">{mt.name}</span>
                    <button onClick={() => startEdit(mt)} className="p-2 text-gray-300 hover:text-emerald-500">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(mt.id)} className="p-2 text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
