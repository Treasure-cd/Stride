import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { userApi } from '../lib/api'
import { auth } from '../firebase'

type AuthContextType = {
  user: User | null
  loading: boolean
  displayName: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  displayName: "",
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Initialize with localStorage if it exists so there's no UI flicker
  const [displayName, setDisplayName] = useState(localStorage.getItem("name") || "")

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
    <AuthContext.Provider value={{ user, loading, displayName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}