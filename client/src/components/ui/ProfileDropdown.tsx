import { useState, useRef, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SignOutIcon, GearIcon, UserIcon } from '../../lib/icons'
import defaultAvatar from '../../assets/default_pfp.jpg'

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { displayName, avatarUrl } = useAuth()

  useEffect(() => {
    console.log(displayName)
  }, [])

    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClick)

      return () => document.removeEventListener('mousedown', handleClick)
    }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/auth')
    } catch (err) {
      console.error('Sign out error', err)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-9 w-9 rounded-full overflow-hidden border border-(--border-subtle) flex items-center justify-center bg-(--bg-elevated) text-(--text-h) font-bold text-sm hover:opacity-80 transition-opacity cursor-pointer"
        aria-label="Open profile menu"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <img
            src={defaultAvatar}
            alt="Default profile"
            className="h-full w-full object-cover"
            />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-(--border-subtle) bg-(--bg) shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-sm text-(--text) opacity-80 border-b border-(--border-subtle)">
            Hi, <span className="text-(--text-h) font-bold opacity-100">{displayName || 'User'}</span>
          </div>
          <button
            onClick={() => { setOpen(false); navigate('/profile') }}
            className="w-full text-left px-4 py-2 text-sm text-(--text) hover:bg-(--bg-elevated) flex items-center gap-2"
          >
            <UserIcon size={16} /> Profile
          </button>
          <button
            onClick={() => { setOpen(false); navigate('/settings') }}
            className="w-full text-left px-4 py-2 text-sm text-(--text) hover:bg-(--bg-elevated) flex items-center gap-2"
          >
            <GearIcon size={16} /> Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-(--text) hover:bg-(--bg-elevated) flex items-center gap-2"
          >
            <SignOutIcon size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  )
}