import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { userApi, preferencesApi } from '../lib/api'
import { auth } from '../firebase'
import { PreferencesDoc } from '../lib/api'


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
  // Initialize with localStorage if it exists so there's no UI flicker
  const [displayName, setDisplayName] = useState(localStorage.getItem("name") || "")
  const [preferences, setPreferences] = useState<PreferencesDoc | null>(() => {
    const saved = localStorage.getItem("user_prefs");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // onAuthStateChanged manages its own listeners, we only need to mount this once.
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        try {
          // Await the DB fetch BEFORE stopping the loading spinner
          const userData = await userApi.get();
          if (userData && userData.profile) {
            setDisplayName(userData.profile.name);
            localStorage.setItem("name", userData.profile.name); // Keep LS in sync
          }

  let prefsData = null;
          try {
            prefsData = await preferencesApi.get();
            if (prefsData) {
              setPreferences(prefsData);
              localStorage.setItem("user_prefs", JSON.stringify(prefsData)); // Sync local storage
              console.log(prefsData);
            }
          } catch {
            // Preferences may not exist yet (e.g., during onboarding)
          }

          pendo.identify({
            visitor: {
              id: currentUser.uid,
              email: userData?.email || '',
              full_name: userData?.profile?.name || '',
              createdAt: userData?.createdAt || '',
              profileName: userData?.profile?.name || '',
              profileInstitution: userData?.profile?.institution || '',
              disabilities: prefsData?.disabilities || [],
              preferredStudyTime: prefsData?.schedulePreferences?.preferredStudyTime || '',
              maxSessionMinutes: prefsData?.schedulePreferences?.maxSessionMinutes || 0,
              breakFrequency: prefsData?.schedulePreferences?.breakFrequency || '',
            }
          });
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      } else {
        // Clear everything out on logout
        setDisplayName("");
        localStorage.removeItem("name");
      }
      
      // Finally, let the app proceed
      setLoading(false)
    })

    return () => unsubscribe()
  }, []) // <-- CRITICAL: Remove `user` from here to prevent infinite re-renders

  return (
    <AuthContext.Provider value={{ user, loading, displayName, preferences }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}