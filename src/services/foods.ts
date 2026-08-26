import { api } from './api'

export interface Food {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  is_default: boolean
  user_id: string | null
  created_at: string
}

export async function getFoods(): Promise<Food[]> {
  try {
    return await api.get<Food[]>('/foods')
  } catch {
    return []
  }
}

export async function searchFoods(query: string): Promise<Food[]> {
  try {
    return await api.get<Food[]>(`/foods/search?q=${encodeURIComponent(query)}`)
  } catch {
    return []
  }
}

export async function createFood(food: Omit<Food, 'id' | 'user_id' | 'created_at' | 'is_default'>): Promise<Food | null> {
  try {
    return await api.post<Food>('/foods', food)
  } catch {
    return null
  }
}

export async function deleteFood(id: string): Promise<boolean> {
  try {
    await api.delete(`/foods/${id}`)
    return true
  } catch {
    return false
  }
}
