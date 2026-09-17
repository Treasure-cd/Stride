import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SignOutIcon } from '../../lib/icons'
import logoUrl from '../../assets/logo.png'

export default function Navbar() {
  const navigate = useNavigate()
  const { displayName } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/auth')
    } catch (err) {
      console.error('Sign out error', err)
    }
  }

  return (
    <nav className="w-full border-b border-(--border-subtle) bg-(--bg)/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors">
      <div className="flex items-center">
        <img
          src={logoUrl}
          alt="Stride Logo"
          className="h-7 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        />
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <span className="text-sm font-medium text-(--text) opacity-80">
          Hi, <span className="text-(--text-h) font-bold opacity-100">{displayName || 'User'}</span>!
        </span>

        <button
          onClick={handleLogout}
          title="Log out"
          className="p-2 rounded-lg text-(--text) opacity-60 hover:opacity-100 hover:text-(--text-h) hover:bg-(--bg-elevated) transition-all cursor-pointer"
          aria-label="Log out"
        >
          <SignOutIcon size={20} strokeWidth={2} />
        </button>
      </div>
    </nav>
  )
}