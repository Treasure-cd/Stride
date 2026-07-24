import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { recommendationsApi } from '../../lib/api'
import type { RecommendationsResponse, RecommendationTask } from '../../lib/api'
import { useState, useEffect } from 'react'
import { BooksIcon, ListChecksIcon, BedIcon, WarningIcon } from '../../lib/icons'
import { useAuth } from '../../context/AuthContext'


const ASSESSMENT_PRIORITY_DISABILITIES = ['Focus & Attention', 'Anxiety & Overwhelm']

function getTaskPriority(task: RecommendationTask, prioritizeAssessments: boolean) {
  if (task.type === 'assessment') return prioritizeAssessments ? 0 : 3
  if (task.type === 'topic') return 1
  if (task.type === 'quiz') return 2
  return 4 // rest
}



const TASK_CONFIG = {
  topic: {
    label: 'Topic',
    icon: <BooksIcon size={16} />,
    iconClass: 'b] text-[#a78bfa]',
    labelClass: 'text-[#a78bfa]',
  },
  quiz: {
    label: 'Quiz',
    icon: <ListChecksIcon size={16} />,
    iconClass: 'bg-[#1e2a1e] text-[#6ee7b7]',
    labelClass: 'text-[#6ee7b7]',
  },
  assessment: {
    label: 'Assessment',
    icon: <WarningIcon size={16} />,
    iconClass: 'bg-[#2d1a1a] text-[#f87171]',
    labelClass: 'text-[#f87171]',
  },
  rest: {
    label: 'Rest',
    icon: <BedIcon size={16} />,
    iconClass: 'bg-[#1a2535] text-[#93c5fd]',
    labelClass: 'text-[#93c5fd]',
  },
}

const MOOD_LABEL: Record<string, string> = {
  great: 'Feeling great today',
  neutral: 'Feeling neutral today',
  overwhelmed: 'Feeling overwhelmed today',
}

const MOOD_DOT: Record<string, string> = {
  great: 'bg-[#6ee7b7]',
  neutral: 'bg-[#fbbf24]',
  overwhelmed: 'bg-[#f87171]',
}

function TaskCard({ task }: { task: RecommendationTask }) {
  const config = TASK_CONFIG[task.type]

  const getTitle = () => {
    if (task.type === 'topic') return (task.data as any)?.title
    if (task.type === 'quiz') return `Test yourself on ${(task.data as any)?.topicTitle}`
    if (task.type === 'assessment') return (task.data as any)?.title
    return 'Take a break'
  }

  const getMeta = () => {
    if (task.type === 'topic') return (task.data as any)?.courseId ? 'next in sequence' : null
    if (task.type === 'assessment') {
      const d = task.data as any
      return d?.courseName ?? null
    }
    return null
  }

  const daysUntilDue = task.type === 'assessment' ? (task.data as any)?.daysUntilDue : null

  return (
    <div className="rounded-[10px] border border-[#3d3651] p-4 flex gap-3 items-start">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.iconClass}`}>
        {config.icon}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium uppercase tracking-widest ${config.labelClass}`}>
            {config.label}
          </span>
          {daysUntilDue !== null && daysUntilDue <= 7 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#2d1a1a] text-[#f87171] border border-[#5a2020]">
              {daysUntilDue}d left
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-[#f5f5f5] truncate">{getTitle()}</p>
        {getMeta() && <p className="text-[11px] text-[#6b6580]">{getMeta()}</p>}
        <p className="text-xs text-[#b0b0b0] leading-relaxed mt-0.5">{task.reason}</p>
      </div>
    </div>
  )
}

export function RecommendationsSection() {
  const { preferences } = useAuth()
  const [data, setData] = useState<RecommendationsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return
      setLoading(true)
      recommendationsApi.get()
        .then(setData)
        .catch(() => setError(true))
        .finally(() => setLoading(false))
    })
    return () => unsubscribe()
  }, [])

  if (loading) return <p className="text-xs text-[#6b6580]">Building your plan…</p>
  if (error || !data) return null

  const prioritizeAssessments = preferences?.disabilities?.some((d) =>
    ASSESSMENT_PRIORITY_DISABILITIES.includes(d)
  ) ?? false

  const sortedTasks = [...data.tasks].sort(
    (a, b) => getTaskPriority(a, prioritizeAssessments) - getTaskPriority(b, prioritizeAssessments)
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
        </div>
        <p className="text-[15px] font-medium text-[#f5f5f5]">{data.message}</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {sortedTasks.map((task, i) => (
          <div key={i} className="shrink-0 w-[260px]">
            <TaskCard task={task} />
          </div>
        ))}
      </div>
    </div>
  )
}