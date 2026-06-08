import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminAuthGuard from './components/AdminAuthGuard'
import AdminSignIn from './pages/AdminSignIn'
import AdminDashboard from './pages/AdminDashboard'
import ParentManagement from './pages/ParentManagement'
import WayfinderManagement from './pages/WayfinderManagement'
import Reports from './pages/Reports'
import AlertsCenter from './pages/AlertsCenter'
import AlertInsights from './pages/AlertInsights'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminSignIn />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parents"
          element={
            <ProtectedRoute>
              <ParentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wayfinders"
          element={
            <ProtectedRoute>
              <WayfinderManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <AlertsCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts/insights"
          element={
            <ProtectedRoute>
              <AlertInsights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
