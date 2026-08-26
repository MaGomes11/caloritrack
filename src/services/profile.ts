import { api } from './api'

export interface Profile {
  id: string
  email: string
  name: string
  weight: number
  height: number
  age: number
  sex: 'M' | 'F'
  goal: 'lose' | 'maintain' | 'gain'
  daily_calories: number
  onboarding_done: boolean
  created_at: string
}

export async function getProfile(): Promise<Profile | null> {
  try {
    return await api.get<Profile>('/profile')
  } catch {
    return null
  }
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
  try {
    return await api.put<Profile>('/profile', updates)
  } catch {
    return null
  }
}
