import { useState } from 'react'
import { PlusIcon, LinkIcon, XIcon } from '../../lib/icons'
import type { Note, GeneralStudyLink, MoodState } from '../../lib/api'
import MoodChecker from '../layout/MoodChecker'
import { RecommendationsSection } from '../layout/RecommendationsPanel'
import NoteTile from './NoteTile'

interface HomePanelProps {
  notes: Note[]
  notesLoading: boolean
  isAddingNote: boolean
  setIsAddingNote: (value: boolean) => void
  newNoteContent: string
  setNewNoteContent: (value: string) => void
  newNoteColor: string
  setNewNoteColor: (value: string) => void
  savingNote: boolean
  onAddNote: () => void
  onDeleteNote: (id: string) => void
  links: GeneralStudyLink[]
  linksLoading: boolean
  isAddingLink: boolean
  setIsAddingLink: (value: boolean) => void
  newLinkTitle: string
  setNewLinkTitle: (value: string) => void
  newLinkUrl: string
  setNewLinkUrl: (value: string) => void
  savingLink: boolean
  onAddLink: () => void
  onDeleteLink: (id: string) => void
  todayMood: MoodState | null
  moodLoading: boolean
  onLogMood: (mood: MoodState) => void
}

export default function HomePanel({
  notes,
  notesLoading,
  isAddingNote,
  setIsAddingNote,
  newNoteContent,
  setNewNoteContent,
  newNoteColor,
  setNewNoteColor,
  savingNote,
  onAddNote,
  onDeleteNote,
  links,
  linksLoading,
  isAddingLink,
  setIsAddingLink,
  newLinkTitle,
  setNewLinkTitle,
  newLinkUrl,
  setNewLinkUrl,
  savingLink,
  onAddLink,
  onDeleteLink,
  todayMood,
  moodLoading,
  onLogMood,
}: HomePanelProps) {

  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  return (
    <div className="flex flex-col gap-8">
      <RecommendationsSection />
      {!todayMood && (
        <MoodChecker todayMood={todayMood} moodLoading={moodLoading} onLogMood={onLogMood} />
      )}
<div>
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-base font-semibold text-(--text-h)">Notes</h2>
    {!isAddingNote && (
      <button
        type="button"
        onClick={() => setIsAddingNote(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--accent) hover:opacity-75 transition-opacity cursor-pointer"
      >
        <PlusIcon size={15} /> New note
      </button>
    )}
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {isAddingNote && (
      <div
        className="col-span-full rounded-2xl p-4 flex flex-col gap-3 transition-colors border"
        style={{
          backgroundColor: `color-mix(in srgb, ${newNoteColor} 8%, var(--bg-elevated))`,
          borderColor: `color-mix(in srgb, ${newNoteColor} 35%, var(--border-subtle))`,
        }}
      >
      <textarea
          value={newNoteContent}
          onChange={(event) => setNewNoteContent(event.target.value)}
          placeholder="Jot something down…"
          rows={3}
          autoFocus
          className="w-full bg-transparent text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 outline-none resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between pt-1 border-t border-(--border-subtle)">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newNoteColor}
              onChange={(event) => setNewNoteColor(event.target.value)}
              aria-label="Note accent color"
              className="h-7 w-8 rounded-md border border-(--input-border) bg-(--bg) p-0.5 cursor-pointer"
            />
            <span className="text-[11px] text-(--text) opacity-60">Pick color</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNote(false)}
              className="text-xs text-(--text) opacity-60 hover:opacity-100 px-3 py-1.5 transition-opacity cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onAddNote}
              disabled={savingNote || !newNoteContent.trim()}
              className="text-xs font-medium text-white bg-(--accent) hover:brightness-110 disabled:opacity-50 rounded-lg px-3.5 py-1.5 transition-all cursor-pointer shadow-xs"
            >
              {savingNote ? 'Saving…' : 'Save note'}
            </button>
          </div>
        </div>
      </div>
    )}

    {notesLoading ? (
      <p className="text-xs text-(--text) opacity-50 col-span-full py-2">Loading notes…</p>
    ) : notes.length === 0 && !isAddingNote ? (
      <p className="text-sm text-(--text) opacity-50 col-span-full py-4 text-center">
        Nothing here yet, so go on, jot down a quick note.
      </p>
    ) : (
      notes.map((note) => (
        <NoteTile 
          key={note._id} 
          note={note} 
          onDelete={() => onDeleteNote(note._id)} 
          onClick={() => setSelectedNote(note)} // Added this line
        />
      ))
    )}
  </div>
</div>
<div className="rounded-xl bg-(--bg-elevated) border border-(--border-subtle) p-5">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-base font-semibold text-(--text-h)">General study links</h2>
    {!isAddingLink && (
      <button
        type="button"
        onClick={() => setIsAddingLink(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--accent) hover:opacity-75 transition-opacity cursor-pointer"
      >
        <PlusIcon size={15} /> Add link
      </button>
    )}
  </div>

  {isAddingLink && (
    <div className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-lg bg-(--bg)/60 border border-(--border-subtle) mb-4">
      <input
        type="text"
        value={newLinkTitle}
        onChange={(event) => setNewLinkTitle(event.target.value)}
        placeholder="Title"
        autoFocus
        className="flex-1 rounded-lg bg-(--bg) border border-(--input-border) px-3 py-2 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
      />
      <input
        type="url"
        value={newLinkUrl}
        onChange={(event) => setNewLinkUrl(event.target.value)}
        placeholder="https://..."
        className="flex-1 rounded-lg bg-(--bg) border border-(--input-border) px-3 py-2 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
      />
      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          type="button"
          onClick={() => setIsAddingLink(false)}
          className="text-xs text-(--text) opacity-60 hover:opacity-100 px-3 py-2 transition-opacity cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onAddLink}
          disabled={savingLink || !newLinkTitle.trim() || !newLinkUrl.trim()}
          className="text-xs font-medium text-white bg-(--accent) hover:brightness-110 disabled:opacity-50 rounded-lg px-3.5 py-2 transition-all cursor-pointer shadow-xs"
        >
          {savingLink ? 'Saving…' : 'Add'}
        </button>
      </div>
    </div>
  )}

  <div className="flex flex-col gap-1.5">
    {linksLoading ? (
      <p className="text-xs text-(--text) opacity-50 py-1">Loading links…</p>
    ) : links.length === 0 ? (
      <p className="text-xs text-(--text) opacity-50 py-1">No general links yet.</p>
    ) : (
      links.map((link) => (
        <div
          key={link._id}
          className="group flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-(--bg)/60 transition-colors"
        >
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 text-sm text-(--text) hover:text-(--text-h) truncate transition-colors"
          >
            <LinkIcon size={15} className="text-(--text) opacity-40 group-hover:text-(--accent) group-hover:opacity-100 shrink-0 transition-colors" />
            <span className="truncate font-normal">{link.title}</span>
          </a>
          <button
            type="button"
            onClick={() => onDeleteLink(link._id)}
            aria-label="Delete link"
            className="p-1 rounded-md text-(--text) opacity-40 hover:opacity-100 hover:text-red-400 transition-all shrink-0 cursor-pointer"
          >
            <XIcon size={14} />
          </button>
        </div>
      ))
    )}
  </div>
  </div>
    {todayMood && (
        <MoodChecker todayMood={todayMood} moodLoading={moodLoading} onLogMood={onLogMood} />
      )}
      {selectedNote && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm"
          onClick={() => setSelectedNote(null)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-(--bg-elevated) border shadow-2xl p-6 sm:p-10 flex flex-col gap-4"
            style={{ borderColor: `color-mix(in srgb, ${selectedNote.color} 30%, var(--border-subtle))` }}
            onClick={(e) => e.stopPropagation()} // Prevents clicking inside the modal from closing it
          >
            {/* Modal Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: selectedNote.color }} />
            
            <button
              type="button"
              onClick={() => setSelectedNote(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-(--text) opacity-60 hover:opacity-100 hover:bg-(--bg) transition-all cursor-pointer"
            >
              <XIcon size={24} />
            </button>

            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mt-2" style={{ color: selectedNote.color }}>
              Note
            </h3>
            
            {/* Very large, highly legible text for neurodivergent reading comfort */}
            <p className="text-lg sm:text-xl md:text-2xl text-(--text-h) whitespace-pre-wrap leading-relaxed mt-2">
              {selectedNote.content}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
