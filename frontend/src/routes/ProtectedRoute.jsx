import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import PageLoader from '@/components/ui/PageLoader'

export default function ProtectedRoute() {
  const { isAuth, loading } = useAuth()
  if (loading) return <PageLoader />
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />
}
