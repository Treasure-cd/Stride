import { XIcon } from '../../lib/icons'
import type { Note } from '../../lib/api'

interface NoteTileProps {
  note: Note
  onDelete: () => void
}

export default function NoteTile({ note, onDelete }: NoteTileProps) {
  return (
    <div
      className="group relative aspect-square rounded-2xl p-3.5 flex flex-col justify-between transition-all overflow-hidden"
      style={{
        backgroundColor: `color-mix(in srgb, ${note.color} 10%, var(--bg-elevated))`,
        borderColor: `color-mix(in srgb, ${note.color} 30%, transparent)`,
        borderWidth: 1,
        borderStyle: 'solid',
      }}
    >
      {/* Top Accent Stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: note.color }}
      />

      <p className="text-xs text-(--text-h) line-clamp-6 pt-1 whitespace-pre-wrap leading-relaxed">
        {note.content}
      </p>

      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete note"
        className="self-end p-1 rounded-md text-(--text) opacity-40 hover:opacity-100 hover:text-red-400 transition-opacity cursor-pointer"
      >
        <XIcon size={14} />
      </button>
    </div>
  )
}