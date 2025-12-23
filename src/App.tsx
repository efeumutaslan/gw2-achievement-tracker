import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Achievements } from './pages/Achievements'
import { Settings } from './pages/Settings'
import { useUserStore } from './stores/userStore'

function App() {
  const loadUsers = useUserStore((state) => state.loadUsers)

  // Load users from IndexedDB on app start
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
