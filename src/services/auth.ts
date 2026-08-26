import { api, setToken } from './api'

export interface AuthResponse {
  token: string
  user: { id: string; email: string }
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const data = await api.post<AuthResponse>('/auth/signup', { email, password })
  setToken(data.token)
  return data
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await api.post<AuthResponse>('/auth/login', { email, password })
  setToken(data.token)
  return data
}

export function logout() {
  setToken(null)
}
