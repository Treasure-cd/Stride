import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { userApi, preferencesApi } from '../lib/api'
import { auth } from '../firebase'
import type { ReactNode } from 'react'
import type { PreferencesDoc } from '../lib/api'
import type { User } from 'firebase/auth'


type AuthContextType = {
  user: User | null;
  loading: boolean;
  displayName: string;
  preferences: PreferencesDoc | null
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  displayName: "",
  preferences: null
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState(localStorage.getItem("name") || "")
  const [preferences, setPreferences] = useState<PreferencesDoc | null>(() => {
    const saved = localStorage.getItem("user_prefs");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const userData = await userApi.get();
          if (userData && userData.profile) {
            setDisplayName(userData.profile.name);
            localStorage.setItem("name", userData.profile.name);
          }

        let prefsData = null;
          try {
            prefsData = await preferencesApi.get();
            if (prefsData) {
              setPreferences(prefsData);
              localStorage.setItem("user_prefs", JSON.stringify(prefsData));
              console.log(prefsData);
            }
          } catch {
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      } else {
        setDisplayName("");
        localStorage.removeItem("name");
      } 
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, displayName, preferences }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}