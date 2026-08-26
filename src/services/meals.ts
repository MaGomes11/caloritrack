import { api } from './api'

export interface Meal {
  id: string
  user_id: string
  food_id: string
  food_name: string
  meal_type: 'breakfast' | 'lunch' | 'snack' | 'dinner'
  quantity: number
  calories: number
  protein: number
  carbs: number
  fat: number
  date: string
  created_at: string
}

export async function getMealsByDate(date: string): Promise<Meal[]> {
  try {
    return await api.get<Meal[]>(`/meals/${date}`)
  } catch {
    return []
  }
}

export async function getMealsRange(from: string, to: string): Promise<Meal[]> {
  try {
    return await api.get<Meal[]>(`/meals/range/${from}/${to}`)
  } catch {
    return []
  }
}

export async function createMeal(meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>): Promise<Meal | null> {
  try {
    return await api.post<Meal>('/meals', meal)
  } catch {
    return null
  }
}

export async function deleteMeal(id: string): Promise<boolean> {
  try {
    await api.delete(`/meals/${id}`)
    return true
  } catch {
    return false
  }
}
