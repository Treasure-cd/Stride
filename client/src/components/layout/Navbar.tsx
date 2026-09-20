import { useNavigate } from 'react-router-dom'
import logoUrl from '../../assets/logo.png'
import ProfileDropdown from '../ui/ProfileDropdown'

export default function Navbar() {
  const navigate = useNavigate()

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
        <ProfileDropdown />
      </div>
    </nav>
  )
}