import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { userApi, preferencesApi } from '../lib/api'
import { auth } from '../firebase'
import type { ReactNode } from 'react'
import type { PreferencesDoc, UserDoc } from '../lib/api'
import type { User } from 'firebase/auth'
import type { DisplaySettings } from '../lib/api'


type AuthContextType = {
  user: User | null;
  profile: UserDoc | null;
  loading: boolean;
  displayName: string;
  setDisplayName: (name: string) => void;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  preferences: PreferencesDoc | null
  setPreferences: (prefs: PreferencesDoc | null) => void
  updateDisplaySettings: (settings: Partial<DisplaySettings>) => Promise<void>
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  displayName: "",
  setDisplayName: () => {},
  avatarUrl: null,
  setAvatarUrl: () => {},
  preferences: null,
  setPreferences: () => {},
  updateDisplaySettings: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState(() => localStorage.getItem("name") || "")
  const [preferences, setPreferences] = useState<PreferencesDoc | null>(() => {
    const saved = localStorage.getItem("user_prefs");
    return saved ? JSON.parse(saved) : null;
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => localStorage.getItem("avatarUrl") || null)

  useEffect(() => {
  if (preferences?.displaySettings) {
    const { fontFamily, textSize, letterSpacing, theme } = preferences.displaySettings
    
    // Set global data attributes on the HTML tag
    document.documentElement.dataset.font = fontFamily || 'default'
    document.documentElement.dataset.textSize = textSize || 'default'
    document.documentElement.dataset.letterSpacing = letterSpacing || 'default'
    document.documentElement.dataset.theme = theme || 'dark' // Assuming dark is default
  }
}, [preferences?.displaySettings])

  useEffect(() => {
    let isMounted = true

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return

      setUser(currentUser)

      if (!currentUser) {
        setProfile(null)
        setDisplayName("")
        setAvatarUrl(null)
        localStorage.removeItem("name")
        localStorage.removeItem("avatarUrl")
        setLoading(false)
        return
      }

      try {
        const userData = await userApi.get()

        if (!isMounted) return

        if (userData && userData.profile) {
          setProfile(userData)

          const nextName = userData.profile.name || currentUser.displayName || ""
          setDisplayName(nextName)
          if (nextName) {
            localStorage.setItem("name", nextName)
          } else {
            localStorage.removeItem("name")
          }

          const nextAvatar = userData.profile.avatarUrl || null
          setAvatarUrl(nextAvatar)
          if (nextAvatar) {
            localStorage.setItem("avatarUrl", nextAvatar)
          } else {
            localStorage.removeItem("avatarUrl")
          }
        } else {
          setProfile(null)
          setDisplayName(currentUser.displayName || "")
          setAvatarUrl(null)
          localStorage.removeItem("avatarUrl")
        }

        let prefsData: PreferencesDoc | null = null
        try {
          prefsData = await preferencesApi.get()
          if (prefsData && isMounted) {
            setPreferences(prefsData)
            console.log(prefsData)
            localStorage.setItem("user_prefs", JSON.stringify(prefsData))
          }
        } catch {
          // ignore preferences fetch failure if the user record loads already
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error)
        if (isMounted) {
          setProfile(null)
          setDisplayName(currentUser.displayName || "")
          setAvatarUrl(null)
          localStorage.removeItem("avatarUrl")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const updateDisplaySettings = async (settings: Partial<DisplaySettings>) => {
  const updated = await preferencesApi.update({ displaySettings: settings })
  setPreferences(updated)
  localStorage.setItem("user_prefs", JSON.stringify(updated))
}

  return (
    <AuthContext.Provider value={{ user, profile, loading, displayName, setDisplayName, avatarUrl, setAvatarUrl, preferences, setPreferences, updateDisplaySettings }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}