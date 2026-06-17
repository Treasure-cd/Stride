import { MoodState } from "../../lib/api";

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
    const logged = MOODS.find((m) => m.value === todayMood)!
    return (
      <div className="flex items-center gap-2 text-sm text-bold text-[#b0b0b0]">
        <span>{logged.emoji}</span>
        <span>Feeling... <span className="text-[#f5f5f5]">{logged.label}</span> today</span>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[#3d3651] p-5 flex flex-col gap-3">
      <p className="text-sm font-medium text-[#f5f5f5]">How are you feeling right now?</p>
      <div className="flex gap-3">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => onLogMood(mood.value)}
            className="flex-1 flex flex-col cursor-pointer items-center gap-1.5 rounded-lg border border-[#3d3651] py-3 text-[#b0b0b0] hover:border-[#6d28d9] hover:text-[#f5f5f5] transition-colors"
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-xs">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}