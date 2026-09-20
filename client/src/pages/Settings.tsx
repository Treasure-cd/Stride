import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, CheckIcon } from '../lib/icons'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'

// Configuration for our self-demonstrating options
const FONT_OPTIONS = [
  { id: 'default', label: 'Default', style: { fontFamily: 'inherit' } },
  { id: 'comic-neue', label: 'Comic Neue', style: { fontFamily: '"Comic Neue", sans-serif' } },
  { id: 'opendyslexic', label: 'OpenDyslexic', style: { fontFamily: '"OpenDyslexic", sans-serif' } },
  { id: 'lexend', label: 'Lexend', style: { fontFamily: '"Lexend", sans-serif' } },
]

const SIZE_OPTIONS = [
  { id: 'default', label: 'Default' },
  { id: 'large', label: 'Large' },
  { id: 'xlarge', label: 'X-Large' },
]

const SPACING_OPTIONS = [
  { id: 'default', label: 'Default' },
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'wide', label: 'Wide' },
]

const THEME_OPTIONS = [
  { id: 'dark', label: 'Dark', color: '#1a1a1a', border: '#333333' },
  { id: 'light', label: 'Light', color: '#f9fafb', border: '#e5e7eb' },
  { id: 'cream', label: 'Cream', color: '#FDFBF7', border: '#e5e0d8' },
  { id: 'soft-blue', label: 'Soft Blue', color: '#F0F6FA', border: '#d5e1eb' },
  { id: 'soft-green', label: 'Soft Green', color: '#F0FAF4', border: '#d5ebd9' },
]

export default function Settings() {
  const navigate = useNavigate()
  const { preferences, updateDisplaySettings } = useAuth()

  
  // Local state initialized from context
  const [displayPrefs, setDisplayPrefs] = useState({
    fontFamily: preferences?.displaySettings?.fontFamily || 'default',
    textSize: preferences?.displaySettings?.textSize || 'default',
    letterSpacing: preferences?.displaySettings?.letterSpacing || 'default',
    theme: preferences?.displaySettings?.theme || 'dark',
  })

const hasReadingDisability = preferences?.disabilities?.includes('Reading & Writing') ?? false

const handlePrefChange = (key: string, value: string) => {
  const newPrefs = { ...displayPrefs, [key]: value }
  setDisplayPrefs(newPrefs)

  if (key === 'fontFamily') document.documentElement.dataset.font = value
  if (key === 'textSize') document.documentElement.dataset.textSize = value
  if (key === 'letterSpacing') document.documentElement.dataset.letterSpacing = value
  if (key === 'theme') document.documentElement.dataset.theme = value

  updateDisplaySettings(newPrefs).catch((err: any) => {
    console.error("Failed to save preference silently:", err)
  })
}

 
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-(--bg) px-6 py-12 text-(--text) sm:px-8 lg:px-10 transition-colors duration-300">
        <div className="mx-auto max-w-4xl">
          
          <div className="mb-10 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center rounded-xl border border-(--border-subtle) bg-(--bg-elevated) p-2.5 text-(--text) transition-all hover:bg-(--bg)/60 hover:text-(--text-h) cursor-pointer"
            >
              <ArrowLeftIcon size={18} />
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-(--text-h)">Settings</h1>
          </div>

          <div className="flex flex-col gap-8">
            {hasReadingDisability && (
              <section className="rounded-3xl border border-(--border-subtle) bg-(--bg-elevated) p-6 shadow-sm sm:p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-(--text-h)">Reading & Display</h2>
                  <p className="text-sm text-(--text) opacity-70 mt-1">
                    Adjust how text looks across the app. Changes are saved automatically.
                  </p>
                </div>

                <div className="flex flex-col gap-10">
                  
                  {/* FONT FAMILY */}
                  <div>
                    <h3 className="text-sm font-semibold text-(--text-h) mb-3 uppercase tracking-wider opacity-80">Font Style</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {FONT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handlePrefChange('fontFamily', opt.id)}
                          style={opt.style} /* Forces the button to render in its own font */
                          className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            displayPrefs.fontFamily === opt.id 
                              ? 'border-(--accent) bg-(--accent-bg) ring-1 ring-(--accent)' 
                              : 'border-(--border-subtle) bg-(--bg) hover:border-(--text) hover:opacity-100 opacity-80'
                          }`}
                        >
                          <span className="font-bold text-(--text-h) text-lg mb-1">{opt.label}</span>
                          <span className="text-sm text-(--text)">The quick brown fox jumps over the lazy dog.</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TEXT SIZE */}
                  <div>
                    <h3 className="text-sm font-semibold text-(--text-h) mb-3 uppercase tracking-wider opacity-80">Text Size</h3>
                    <div className="inline-flex rounded-xl p-1.5 bg-(--bg) border border-(--border-subtle)">
                      {SIZE_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handlePrefChange('textSize', opt.id)}
                          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                            displayPrefs.textSize === opt.id
                              ? 'bg-(--bg-elevated) text-(--text-h) shadow-sm border border-(--border-subtle)'
                              : 'text-(--text) opacity-70 hover:opacity-100 hover:bg-(--bg-elevated)/50 border border-transparent'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LETTER SPACING */}
                  <div>
                    <h3 className="text-sm font-semibold text-(--text-h) mb-3 uppercase tracking-wider opacity-80">Letter Spacing</h3>
                    <div className="inline-flex rounded-xl p-1.5 bg-(--bg) border border-(--border-subtle)">
                      {SPACING_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handlePrefChange('letterSpacing', opt.id)}
                          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                            displayPrefs.letterSpacing === opt.id
                              ? 'bg-(--bg-elevated) text-(--text-h) shadow-sm border border-(--border-subtle)'
                              : 'text-(--text) opacity-70 hover:opacity-100 hover:bg-(--bg-elevated)/50 border border-transparent'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BACKGROUND THEME */}
                  <div>
                    <h3 className="text-sm font-semibold text-(--text-h) mb-3 uppercase tracking-wider opacity-80">Background Theme</h3>
                    <div className="flex flex-wrap gap-4">
                      {THEME_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handlePrefChange('theme', opt.id)}
                          className="group flex flex-col items-center gap-2 cursor-pointer"
                        >
                          <div 
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${
                              displayPrefs.theme === opt.id ? 'ring-2 ring-offset-2 ring-offset-(--bg) ring-(--accent)' : ''
                            }`}
                            style={{ backgroundColor: opt.color, border: `1px solid ${opt.border}` }}
                          >
                            {displayPrefs.theme === opt.id && <CheckIcon size={20} className={opt.id === 'dark' ? 'text-white' : 'text-gray-900'} />}
                          </div>
                          <span className={`text-xs font-medium ${displayPrefs.theme === opt.id ? 'text-(--text-h)' : 'text-(--text) opacity-70'}`}>
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  )
}