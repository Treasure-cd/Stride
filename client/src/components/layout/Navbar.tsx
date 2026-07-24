import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext';
import { SignOutIcon } from '../../lib/icons'

export default function Navbar() {
  const navigate = useNavigate();
  const { displayName } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/auth')
    } catch (err) {
      console.error('Sign out error', err)
    }
  }

  return (
    <nav className="w-full border-b border-[#3d3651] bg-[#111111] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center">
        <span className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-purple-600">
          Stride
        </span>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <span className="text-sm font-extrabold text-[#b0b0b0]">
          {/* Failsafe fallback to 'User' just in case */}
          Hi, <span className="text-[#f5f5f5]">{displayName || 'User'}</span>!
        </span>
        
        <button
          onClick={handleLogout}
          title="Log out"
          className="p-2 rounded-md text-[#b0b0b0] hover:text-[#f5f5f5] hover:bg-[#3d3651]/30 transition-all cursor-pointer"
          aria-label="Log out"
        >
         <SignOutIcon size={22} strokeWidth={2} />
        </button>
      </div>
    </nav>
  )
}