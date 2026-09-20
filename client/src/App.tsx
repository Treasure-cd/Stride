import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import OnboardingFlow from './pages/Onboard'
import Settings from './pages/Settings'
import Home from './pages/Home'
import Auth from './pages/Auth'
import AuthCheck from './pages/AuthCheck'
import Create from './pages/Create'
import Profile from './pages/Profile'

function AccessibilitySync() {
  const { preferences } = useAuth()

  useEffect(() => {
    if (!preferences?.displaySettings) return
    const { fontFamily, textSize, letterSpacing, theme } = preferences.displaySettings

    document.documentElement.dataset.font = fontFamily
    document.documentElement.dataset.textSize = textSize
    document.documentElement.dataset.letterSpacing = letterSpacing
    document.documentElement.dataset.background = theme
  }, [preferences?.displaySettings])

  return null
}

function AppRoutes() {
  return (
    <>
      <AccessibilitySync />
      <Routes>
        <Route path="/" element={<AuthCheck />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/edit/:semesterId" element={<Create />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/settings' element={<Settings />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}