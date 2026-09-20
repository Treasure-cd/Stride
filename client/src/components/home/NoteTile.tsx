import { XIcon } from '../../lib/icons'
import type { Note } from '../../lib/api'

interface NoteTileProps {
  note: Note
  onDelete: () => void
  onClick: () => void // Added onClick prop
}

export default function NoteTile({ note, onDelete, onClick }: NoteTileProps) {
  return (
    <div
      onClick={onClick}
      className="group relative min-h-[140px] rounded-2xl p-4 flex flex-col justify-between transition-all overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
      style={{
        backgroundColor: `color-mix(in srgb, ${note.color} 10%, var(--bg-elevated))`,
        borderColor: `color-mix(in srgb, ${note.color} 30%, transparent)`,
        borderWidth: 1,
        borderStyle: 'solid',
      }}
    >
      {/* Top Accent Stripe - Made slightly thicker */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: note.color }}
      />

      {/* Increased text size to text-sm/base and improved spacing */}
      <p className="text-sm sm:text-base text-(--text-h) line-clamp-5 pt-1 whitespace-pre-wrap leading-relaxed flex-1">
        {note.content}
      </p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation() // Stops the modal from opening when you click delete
          onDelete()
        }}
        aria-label="Delete note"
        className="self-end mt-2 p-1.5 rounded-md text-(--text) opacity-40 hover:opacity-100 hover:bg-red-400/10 hover:text-red-400 transition-all cursor-pointer z-10"
      >
        <XIcon size={18} /> {/* Made icon slightly bigger */}
      </button>
    </div>
  )
}