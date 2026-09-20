import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../lib/api'
import { uploadAvatar } from '../lib/uploadAvatar'
import { ArrowLeftIcon, CameraIcon } from '../lib/icons'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const [isUploading, setIsUploading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false) // Added edit mode state
  const navigate = useNavigate()
  const { loading: authLoading, user: authUser, profile, setAvatarUrl } = useAuth()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    setIsUploading(true)
    try {
      const secureUrl = await uploadAvatar(file)
      const updatedUser = await userApi.updateAvatar(secureUrl)

      if (!updatedUser?.profile) {
        throw new Error('Profile update returned no profile data.')
      }

      setAvatarUrl(updatedUser.profile.avatarUrl || null)
      localStorage.setItem('avatarUrl', updatedUser.profile.avatarUrl || '')
    } catch (error) {
      console.error('Error updating avatar:', error)
    } finally {
      setIsUploading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg)">
        <Spinner size={32} className="text-(--accent)" />
      </div>
    )
  }

  if (!authUser || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg) px-6 text-(--text)">
        <p className="text-base text-(--text) opacity-70">Profile details are unavailable right now.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-(--bg) px-6 py-12 text-(--text) sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center rounded-xl border border-(--border-subtle) bg-(--bg-elevated) p-2.5 text-(--text) transition-all hover:opacity-100 hover:bg-(--bg)/60 hover:text-(--text-h) cursor-pointer"
              aria-label="Go back home"
            >
              <ArrowLeftIcon size={18} />
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-(--text-h)">Profile</h1>
          </div>

          {/* Changed this button to toggle Edit Mode instead of opening the file picker directly */}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-elevated) px-4 py-2 text-sm font-medium text-(--text) transition-all hover:opacity-100 hover:bg-(--bg)/60 hover:text-(--text-h) cursor-pointer"
            aria-label={isEditMode ? "Cancel editing" : "Edit profile"}
          >
            {isEditMode ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="rounded-3xl border border-(--border-subtle) bg-(--bg-elevated) p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
              <div className="relative">
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-(--bg) ring-4 ring-(--bg) shadow-sm sm:h-40 sm:w-40">
                  {profile.profile.avatarUrl ? (
                    <img
                      src={profile.profile.avatarUrl}
                      alt={profile.profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold uppercase tracking-wide text-(--text) opacity-40">
                      {profile.profile.name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>

                {/* Only display the change avatar overlay if isEditMode is true */}
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-[2px] transition-opacity hover:bg-black/50 disabled:cursor-not-allowed"
                    aria-label="Upload new profile photo"
                  >
                    {isUploading ? (
                      <Spinner size={24} className="text-white" />
                    ) : (
                      <>
                        <CameraIcon size={28} className="mb-1" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Change</span>
                      </>
                    )}
                  </button>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex-1 lg:max-w-xl">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-(--text) opacity-60">
                  Personal details
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-(--text-h) sm:text-4xl">
                  {profile.profile.name}
                </h2>

                {profile.profile.institution && (
                  <p className="text-base font-medium text-(--text) opacity-70">
                    {profile.profile.institution}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}