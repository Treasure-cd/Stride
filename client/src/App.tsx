import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import OnboardingFlow from './pages/Onboard'

import Home from './pages/Home'
import Auth from './pages/Auth'
import AuthCheck from './pages/AuthCheck'

export default function App() {

  return (
    <>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<AuthCheck />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
      </Routes>
    </AuthProvider>
    </>
  )
}