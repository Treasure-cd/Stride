import type { MoodState } from "../../lib/api"

const MOODS: { value: MoodState; emoji: string; label: string }[] = [
  { value: 'overwhelmed', emoji: '😫', label: 'Overwhelmed' },
  { value: 'neutral',     emoji: '😐', label: 'Okay'        },
  { value: 'great',       emoji: '✨', label: 'Great'       },
]

export default function MoodChecker({
  todayMood,
  moodLoading,
  onLogMood,
}: {
  todayMood: MoodState | null
  moodLoading: boolean
  onLogMood: (mood: MoodState) => void
}) {
  if (moodLoading) return null

  if (todayMood) {
    const logged = MOODS.find((m) => m.value === todayMood)
    return (
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-(--bg-elevated) border border-(--border-subtle) text-sm">
        <span className="text-lg">{logged?.emoji}</span>
        <span className="text-(--text) text-xs">
          Feeling <strong className="text-(--text-h) font-medium lowercase">{logged?.label}</strong> today
        </span>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-xl bg-(--bg-elevated) border border-(--border-subtle) flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-(--text-h)">How are you feeling right now?</p>
        <span className="text-[11px] text-(--text) opacity-50">Daily check-in</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => onLogMood(mood.value)}
            className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-(--bg) border border-(--input-border) py-3 px-2 text-(--text) hover:border-(--accent) hover:text-(--text-h) hover:bg-(--accent-bg) transition-all cursor-pointer group"
          >
            <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
              {mood.emoji}
            </span>
            <span className="text-xs font-medium opacity-80 group-hover:opacity-100">
              {mood.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}