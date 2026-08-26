import { api } from './api'

export interface MealType {
  id: string
  user_id: string
  name: string
  sort_order: number
  created_at: string
}

export async function getMealTypes(): Promise<MealType[]> {
  try {
    return await api.get<MealType[]>('/meal-types')
  } catch {
    return []
  }
}

export async function createMealType(name: string): Promise<MealType | null> {
  try {
    return await api.post<MealType>('/meal-types', { name })
  } catch {
    return null
  }
}

export async function updateMealType(id: string, name: string): Promise<MealType | null> {
  try {
    return await api.put<MealType>(`/meal-types/${id}`, { name })
  } catch {
    return null
  }
}

export async function deleteMealType(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await api.delete(`/meal-types/${id}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
