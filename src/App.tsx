import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { AddMealPage } from './pages/AddMealPage'
import { FoodListPage } from './pages/FoodListPage'
import { DiaryPage } from './pages/DiaryPage'
import { ProgressPage } from './pages/ProgressPage'
import { ProfilePage } from './pages/ProfilePage'
import { MealTypesPage } from './pages/MealTypesPage'
import { PricingPage } from './pages/PricingPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userId, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    )
  }
  if (!userId) return <Navigate to="/" />
  return <>{children}</>
}

function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { userId, subscription, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    )
  }
  if (!userId) return <Navigate to="/" />
  const isActive = subscription?.status === 'active'
  if (!isActive) return <Navigate to="/pricing" />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { userId, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    )
  }
  if (userId) return <Navigate to="/dashboard" />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<SubscriptionGuard><DashboardPage /></SubscriptionGuard>} />
      <Route path="/add-meal" element={<SubscriptionGuard><AddMealPage /></SubscriptionGuard>} />
      <Route path="/food-list" element={<SubscriptionGuard><FoodListPage /></SubscriptionGuard>} />
      <Route path="/diary" element={<SubscriptionGuard><DiaryPage /></SubscriptionGuard>} />
      <Route path="/progress" element={<SubscriptionGuard><ProgressPage /></SubscriptionGuard>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/meal-types" element={<SubscriptionGuard><MealTypesPage /></SubscriptionGuard>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
