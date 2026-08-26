import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { getToken } from '../services/api'
import { getProfile } from '../services/profile'
import { logout as authLogout } from '../services/auth'
import { getSubscriptionStatus } from '../services/subscriptions'
import type { Profile } from '../services/profile'
import type { SubscriptionStatus } from '../services/subscriptions'

interface AuthContextType {
  userId: string | null
  profile: Profile | null
  subscription: SubscriptionStatus | null
  loading: boolean
  refreshProfile: () => Promise<void>
  refreshSubscription: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  profile: null,
  subscription: null,
  loading: true,
  refreshProfile: async () => {},
  refreshSubscription: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadSession() {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const p = await getProfile()
      if (p) {
        setUserId(p.id)
        setProfile(p)
        const sub = await getSubscriptionStatus()
        setSubscription(sub)
      }
    } catch {
      setUserId(null)
      setProfile(null)
      setSubscription(null)
    }
    setLoading(false)
  }

  const refreshProfile = useCallback(async () => {
    const p = await getProfile()
    if (p) {
      setUserId(p.id)
      setProfile(p)
    }
  }, [])

  const refreshSubscription = useCallback(async () => {
    const sub = await getSubscriptionStatus()
    setSubscription(sub)
  }, [])

  function logout() {
    authLogout()
    setUserId(null)
    setProfile(null)
    setSubscription(null)
  }

  useEffect(() => {
    loadSession()
  }, [])

  return (
    <AuthContext.Provider value={{ userId, profile, subscription, loading, refreshProfile, refreshSubscription, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
