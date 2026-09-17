import type { Course } from '../../lib/api'

interface CourseTabProps {
  course: Course
  isSelected: boolean
  onClick: () => void
}

export default function CourseTab({ course, isSelected, onClick }: CourseTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`shrink-0 text-left w-[140px] h-[90px] rounded-xl relative overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-(--bg-elevated) shadow-md ring-2 lg:translate-x-1.5'
          : 'bg-(--bg-elevated)/60 border border-(--border-subtle) hover:bg-(--bg-elevated) hover:border-(--border)'
      }`}
      style={{
        // Uses the course color for the active ring while keeping CSS classes clean
        ...(isSelected ? { '--tw-ring-color': course.themeColor } as React.CSSProperties : {}),
      }}
    >
      {/* Top Banner Accent Stripe */}
      <div
        className="w-full h-5 transition-opacity"
        style={{
          backgroundColor: course.themeColor,
          opacity: isSelected ? 1 : 0.75,
        }}
      />

      <div className="flex flex-col items-center justify-center h-[calc(100%-20px)] px-3 text-center gap-0.5">
        <span className="text-xs font-semibold text-(--text-h) line-clamp-2">
          {course.name}
        </span>
        <span className="text-[10px] font-medium text-(--text) opacity-60 capitalize">
          {course.difficulty}
        </span>
      </div>
    </button>
  )
}