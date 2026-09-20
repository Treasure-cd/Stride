import type { MoodState } from "../../lib/api"

const CAPACITY_LEVELS: { 
  value: MoodState; 
  level: number; 
  label: string; 
  color: string;
  hover: string;
}[] = [
  { 
    value: 'overwhelmed', 
    level: 1, 
    label: 'Running on Empty', 
    color: 'text-red-400 border-red-400',
    hover: 'hover:border-red-400/50 hover:bg-red-400/10 hover:text-red-400'
  },
  { 
    value: 'neutral',     
    level: 2, 
    label: 'Half Charge',      
    color: 'text-amber-400 border-amber-400',
    hover: 'hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400'
  },
  { 
    value: 'great',       
    level: 3, 
    label: 'Fully Charged',    
    color: 'text-emerald-400 border-emerald-400',
    hover: 'hover:border-emerald-400/50 hover:bg-emerald-400/10 hover:text-emerald-400'
  },
]

// A clean, scalable battery icon built with divs for maximum legibility
const BatteryIcon = ({ level, colorClass }: { level: number; colorClass: string }) => (
  <div className={`relative flex items-center ${colorClass.split(' ')[0]}`}>
    <div className="w-8 h-4 sm:w-10 sm:h-5 border-2 border-current rounded-sm flex p-0.5 gap-0.5">
      <div className={`h-full flex-1 rounded-[1px] transition-colors ${level >= 1 ? 'bg-current' : 'bg-transparent'}`} />
      <div className={`h-full flex-1 rounded-[1px] transition-colors ${level >= 2 ? 'bg-current' : 'bg-transparent'}`} />
      <div className={`h-full flex-1 rounded-[1px] transition-colors ${level >= 3 ? 'bg-current' : 'bg-transparent'}`} />
    </div>
    <div className="w-1 h-2 sm:h-2.5 rounded-r-sm ml-[1px] bg-current" />
  </div>
)

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
    const logged = CAPACITY_LEVELS.find((m) => m.value === todayMood)
    return (
      <div className="inline-flex items-center gap-3.5 px-5 py-3.5 rounded-xl bg-(--bg-elevated) border border-(--border-subtle) shadow-sm">
        <BatteryIcon level={logged?.level || 0} colorClass={logged?.color || 'text-(--text)'} />
        <span className="text-(--text) text-sm sm:text-base">
          Current capacity: <strong className={`font-semibold ${logged?.color.split(' ')[0]}`}>{logged?.label}</strong>
        </span>
      </div>
    )
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-(--bg-elevated) border border-(--border-subtle) flex flex-col gap-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-base sm:text-lg font-semibold text-(--text-h)">What is your current capacity?</p>
        <span className="text-xs font-medium text-(--text) opacity-50 uppercase tracking-wider hidden sm:block">Energy Check-In</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {CAPACITY_LEVELS.map((capacity) => (
          <button
            key={capacity.value}
            type="button"
            onClick={() => onLogMood(capacity.value)}
            className={`flex sm:flex-col items-center justify-start sm:justify-center gap-4 sm:gap-3 rounded-xl bg-(--bg) border border-(--input-border) p-4 text-(--text) transition-all cursor-pointer group ${capacity.hover}`}
          >
            <div className="transition-transform duration-200 group-hover:scale-105">
              <BatteryIcon level={capacity.level} colorClass={capacity.color} />
            </div>
            <span className="text-sm sm:text-sm font-medium opacity-80 group-hover:opacity-100 text-left sm:text-center">
              {capacity.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}