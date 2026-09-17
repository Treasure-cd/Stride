interface NotesTabProps {
  isSelected: boolean
  onClick: () => void
}

export default function NotesTab({ isSelected, onClick }: NotesTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`shrink-0 text-left w-[140px] h-[90px] rounded-xl relative overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-(--bg-elevated) shadow-md ring-2 ring-(--accent) translate-x-1.5'
          : 'bg-(--bg-elevated)/60 border border-(--border-subtle) hover:bg-(--bg-elevated) hover:border-(--border)'
      }`}
    >
      {/* Pattern Banner Header */}
      <div
        id="pattern-div"
        className="w-full h-5 opacity-80"
      />

      <div className="flex flex-col items-center justify-center h-[calc(100%-20px)] px-3 text-center">
        <span className="text-xs font-medium text-(--text-h) line-clamp-2">
          House
        </span>
      </div>
    </button>
  )
}