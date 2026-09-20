import { useState } from 'react'
import { getAuth } from 'firebase/auth'
import type { LearningProfile } from '../../types/onboarding'

const PROFILE_SUB_OPTIONS: Record<Exclude<LearningProfile, 'Standard Track'>, { key: string; label: string }[]> = {
  'Focus & Attention': [
    { key: 'focusIssues', label: 'General focus issues' },
    { key: 'startingTasksIsHard', label: 'Getting started on tasks is difficult' },
    { key: 'losesTrackMidTask', label: 'I lose track in the middle of a task' },
    { key: 'misjudgesTime', label: 'I struggle to estimate how long things take (Time blindness)' },
    { key: 'switchingTasksIsHard', label: 'Switching between tasks is difficult' },
  ],
  'Reading & Writing': [
    { key: 'readingIsSlowOrDraining', label: 'Reading is slow or mentally draining' },
    { key: 'strugglesWithUnderstandingText', label: 'I struggle to comprehend text' },
    { key: 'writingOrganizationIsHard', label: 'Organizing my thoughts for writing is hard' },
    { key: 'spellingOrWordFindingIsHard', label: 'I struggle with spelling or finding the right words' },
  ],
  'Energy & Pacing': [
    { key: 'energyFluctuatesALot', label: 'My energy levels fluctuate a lot' },
    { key: 'needsFrequentBreaks', label: 'I need frequent breaks' },
    { key: 'morningsAreHard', label: 'Mornings are especially hard for me' },
    { key: 'eveningsAreHard', label: 'Evenings are especially hard for me' },
    { key: 'canCrashAfterBusyDays', label: 'I crash hard after a busy day' },
  ],
  'Anxiety & Overwhelm': [
    { key: 'anxietyAroundSchoolTasks', label: 'I feel anxiety around school tasks' },
    { key: 'avoidsTasksDueToOverwhelm', label: 'I avoid tasks because I get overwhelmed' },
    { key: 'sensoryOverload', label: 'I am prone to sensory overload' },
    { key: 'suddenChangesAreHard', label: 'Sudden schedule changes are difficult' },
    { key: 'groupSettingsAreDraining', label: 'Group settings drain my energy' },
  ],
}

const LEARNING_PROFILES: { id: LearningProfile; label: string; description: string }[] = [
  { id: 'Focus & Attention', label: 'Focus & Attention', description: 'Help with sustained focus, distractions, and attention regulation' },
  { id: 'Reading & Writing', label: 'Reading & Writing', description: 'Support for dyslexia, processing, writing challenges' },
  { id: 'Energy & Pacing', label: 'Energy & Pacing', description: 'Manage fatigue, chronic illness, energy fluctuations' },
  { id: 'Anxiety & Overwhelm', label: 'Anxiety & Overwhelm', description: 'Manage anxiety, sensory overload, and overwhelm' },
  { id: 'Standard Track', label: 'Standard Track', description: 'No specific accommodations needed' },
]

interface Step2Props {
  displayName: string
  onNext: () => void
}

export default function Step2LearningProfile({ displayName, onNext }: Step2Props) {
  const [selectedProfiles, setSelectedProfiles] = useState<LearningProfile[]>([])
  const [learningContext, setLearningContext] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const BASE_URL = import.meta.env.VITE_API_BASE_DEV_URL;

  const toggleProfile = (profile: LearningProfile) => {
    const isSelected = selectedProfiles.includes(profile)
    
    if (profile === 'Standard Track') {
      setSelectedProfiles(isSelected ? [] : ['Standard Track'])
      if (!isSelected) setLearningContext({}) 
    } else if (isSelected) {
      setSelectedProfiles(selectedProfiles.filter((p) => p !== profile))
      const updatedContext = { ...learningContext }
      PROFILE_SUB_OPTIONS[profile as Exclude<LearningProfile, 'Standard Track'>].forEach(sub => delete updatedContext[sub.key])
      setLearningContext(updatedContext)
    } else {
      const newProfiles = selectedProfiles.filter((p) => p !== 'Standard Track')
      setSelectedProfiles([...newProfiles, profile])
    }
  }

  const toggleSubOption = (key: string) => {
    setLearningContext((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const hasSelection = selectedProfiles.length > 0

  const addPreferences = async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error("Authentication required")

    const token = await currentUser.getIdToken()
      const isReadingWriting = selectedProfiles.includes('Reading & Writing')

      const payload = {
        disabilities: selectedProfiles,
        learningContext: learningContext,
        displaySettings: {
          fontFamily: isReadingWriting ? 'comic-neue' : 'default',
          textSize: isReadingWriting ? 'large' : 'default',
        },
      }

    const response = await fetch(`${BASE_URL}/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || "Failed to save preferences.")
    }
  }
  
  const handleSubmit = async () => {
    setIsSaving(true)
    setError(null)
    try {
      await addPreferences()
      onNext()
    } catch (err: any) {
      console.error("Error saving preferences:", err)
      setError(err.message || "We had trouble saving. Please try again.")
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-semibold text-[var(--text-h)] mb-3">Nice to meet you, {displayName || 'there'}</h1>
        <p className="text-[var(--text)]">
          Select the areas where you'd like extra support from Stride.
        </p>
      </div>

      <div>
        <div className="flex flex-col gap-4">
          {LEARNING_PROFILES.map((profile) => {
            const isSelected = selectedProfiles.includes(profile.id)
            const subOptions = profile.id !== 'Standard Track' ? PROFILE_SUB_OPTIONS[profile.id as Exclude<LearningProfile, 'Standard Track'>] : []

            return (
              <div key={profile.id} className="flex flex-col">
                <button
                  onClick={() => toggleProfile(profile.id)}
                  className={`p-5 rounded-md border transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                      : 'border-[var(--input-border)] hover:border-[var(--border-subtle)] bg-transparent'
                  }`}
                  aria-pressed={isSelected}
                  disabled={isSaving}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[var(--text-h)] text-lg">{profile.label}</h3>
                      <p className="text-sm text-[var(--text)] opacity-80 mt-1">{profile.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ml-4 shrink-0 ${
                      isSelected ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--input-border)]'
                    }`}>
                      {isSelected && <span className="text-white text-sm">✓</span>}
                    </div>
                  </div>
                </button>

                {isSelected && subOptions.length > 0 && (
                  <div className="mt-2 ml-4 p-4 border-l-2 border-[var(--border-subtle)] flex flex-col gap-3">
                    <p className="text-xs text-[var(--text)] opacity-70 mb-1">Check all that apply to you (optional):</p>
                    {subOptions.map((option) => (
                      <label key={option.key} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          learningContext[option.key] ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--input-border)] group-hover:border-[var(--border-subtle)]'
                        }`}>
                           {learningContext[option.key] && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="text-sm text-[var(--text)] select-none">{option.label}</span>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={!!learningContext[option.key]} 
                          onChange={() => toggleSubOption(option.key)}
                          disabled={isSaving}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!hasSelection || isSaving}
          className="w-full py-3.5 bg-[var(--accent)] text-white rounded-md font-medium transition-all duration-200 ease-in-out flex justify-center items-center disabled:opacity-50 disabled:bg-[var(--input-border)] disabled:text-[var(--text)] disabled:opacity-50 hover:opacity-80"
        >
          {isSaving ? 'Saving...' : 'Save Learning Profile'}
        </button>
        {!hasSelection && !isSaving && (
          <p className="text-xs text-red-500 text-center mt-3">
            Please select at least one learning profile to continue.
          </p>
        )}
      </div>
    </div>
  )
}