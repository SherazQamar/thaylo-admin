import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminSignIn from './pages/AdminSignIn'
import AdminDashboard from './pages/AdminDashboard'
import ParentManagement from './pages/ParentManagement'
import WayfinderManagement from './pages/WayfinderManagement'
import Reports from './pages/Reports'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminSignIn />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/parents" element={<ParentManagement />} />
        <Route path="/wayfinders" element={<WayfinderManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
