import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/routes/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import PageLoader from '@/components/ui/PageLoader'

const Home      = lazy(() => import('@/pages/Home/Home'))
const Login     = lazy(() => import('@/pages/Auth/Login'))
const Register  = lazy(() => import('@/pages/Auth/Register'))
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'))
const Upload    = lazy(() => import('@/pages/Upload/Upload'))
const Compare   = lazy(() => import('@/pages/Compare/Compare'))
const Reports   = lazy(() => import('@/pages/Reports/Reports'))
const History   = lazy(() => import('@/pages/History/History'))
const Settings  = lazy(() => import('@/pages/Settings/Settings'))
const NotFound  = lazy(() => import('@/pages/NotFound'))

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/"         element={<Home />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected — wrapped in AppLayout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/upload"    element={<Upload />} />
                  <Route path="/compare"   element={<Compare />} />
                  <Route path="/reports"   element={<Reports />} />
                  <Route path="/history"   element={<History />} />
                  <Route path="/settings"  element={<Settings />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
