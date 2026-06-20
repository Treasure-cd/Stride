import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdAdd, MdClose, MdLink, MdEdit } from 'react-icons/md'
import {
  semesterApi,
  topicApi,
  noteApi,
  generalStudyLinkApi,
  moodApi,
  assessmentApi
} from '../lib/api'
import type {
  SemesterDoc,
  Course,
  Topic,
  TopicStatus,
  Note,
  GeneralStudyLink,
  MoodState,
  PreferencesDoc
} from '../lib/api'
import { useAuth } from '../context/AuthContext';
import CourseEditModal from '../components/layout/CourseEditModal'
import Navbar from '../components/layout/Navbar'
import MoodChecker from '../components/layout/MoodChecker'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { RecommendationsSection } from '../components/layout/RecommendationsPanel'
import { celebrate } from '../lib/celebrate'

const Spinner = ({ size = 20 }: { size?: number }) => (
  <svg className="animate-spin text-[#6d28d9]" style={{ height: size, width: size }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

const formatShortDate = (value: Date) =>
  value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

const formatTime = (value: Date) =>
  value.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })

function MetaCard({ label, value, rotate }: { label: string; value: string; rotate: string }) {
  return (
    <div
      className="px-4 py-2.5 rounded-xl border border-[#3d3651] text-center"
      style={{ transform: `rotate(${rotate})` }}
    >
      <p className="text-[10px] uppercase tracking-wider text-[#6b6580]">{label}</p>
      <p className="text-sm font-medium text-[#f5f5f5] whitespace-nowrap">{value}</p>
    </div>
  )
}

function CourseTab({ course, isSelected, onClick }: { course: Course; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className="shrink-0 text-left"
      style={{ 
        width: 140, 
        height: 90,
        transform: isSelected ? 'translateX(6px)' : undefined, 
        transition: 'transform 150ms ease' 
      }}
    >
      <div
        className="relative w-full h-full rounded-xl flex flex-col overflow-hidden"
        style={{
          borderStyle: 'solid',
          borderWidth: isSelected ? 2 : 1, 
          borderColor: isSelected ? course.themeColor : '#3d3651', 
          transition: 'all 150ms ease',
        }}
      >

        <div
          className="absolute top-0 left-0 w-full"
          style={{
            height: '20%',
            backgroundColor: course.themeColor,
          }}
        />

        {/* Content Container */}
        <div className="flex flex-col items-center justify-center h-full text-center px-3 gap-1 pt-[20%]">
          <span className="text-xs font-semibold text-[#f5f5f5] line-clamp-2">{course.name}</span>
          <span className="text-[10px] text-[#b0b0b0] capitalize">{course.difficulty}</span>
        </div>
      </div>
    </button>
  )
}

function NotesTab({ isSelected, onClick }: { isSelected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className="shrink-0 text-left"
      style={{ 
        width: 140, 
        height: 90,
        transform: isSelected ? 'translateX(6px)' : undefined, 
        transition: 'transform 150ms ease' 
      }}
    >
      <div
        className="relative w-full h-full rounded-xl flex flex-col overflow-hidden"
        style={{
          borderStyle: 'solid',
          borderWidth: isSelected ? 2 : 1, 
          borderColor: '#3d3651', 
          transition: 'all 150ms ease',
        }}
      >

        <div
          className="absolute top-0 left-0 w-full"
          id='pattern-div'
          style={{
            height: '20%',
          }}
        />

        {/* Content Container */}
        <div className="flex flex-col items-center justify-center h-full text-center px-3 gap-1 pt-[20%]">
          <span className="text-xs font-semibold text-[#f5f5f5] line-clamp-2">House</span>
        </div>
      </div>
    </button>
  )
}

function NoteTile({ note, onDelete }: { note: Note; onDelete: () => void }) {
  return (
    <div
      className="relative aspect-square rounded-2xl p-3 flex flex-col"
      style={{ borderStyle: 'solid', borderWidth: 1.5, borderColor: note.color }}
    >
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete note"
        className="absolute top-2 right-2 text-[#6b6580] hover:text-red-400 cursor-pointer"
      >
        <MdClose size={14} />
      </button>
      <p className="text-xs text-[#e5e5e5] line-clamp-5 mt-1 whitespace-pre-wrap">{note.content}</p>
    </div>
  )
}

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

function HomePanel({
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


  return (
    <div className="flex flex-col gap-8">
      <RecommendationsSection />
      {!todayMood && (
        <MoodChecker todayMood={todayMood} moodLoading={moodLoading} onLogMood={onLogMood} />
      )}


      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-[#f5f5f5]">Notes</h2>
          {!isAddingNote && (
            <button
              type="button"
              onClick={() => setIsAddingNote(true)}
              className="flex items-center gap-1 text-sm text-[#6d28d9] hover:opacity-70 cursor-pointer"
            >
              <MdAdd size={18} /> New note
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {isAddingNote && (
            <div className="col-span-full rounded-2xl p-4 border border-dashed border-[#3d3651] flex flex-col gap-3">
              <textarea
                value={newNoteContent}
                onChange={(event) => setNewNoteContent(event.target.value)}
                placeholder="Jot something down…"
                rows={3}
                autoFocus
                className="w-full bg-transparent text-sm text-[#f5f5f5] placeholder:text-[#6b6580] outline-none resize-none"
              />
              <div className="flex items-center justify-between">
                <input
                  type="color"
                  value={newNoteColor}
                  onChange={(event) => setNewNoteColor(event.target.value)}
                  className="h-8 w-9 rounded border border-[#3d3651] bg-transparent cursor-pointer"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="text-xs text-[#b0b0b0] hover:opacity-70 px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onAddNote}
                    disabled={savingNote || !newNoteContent.trim()}
                    className="text-xs font-medium text-white bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-50 rounded-md px-3 py-1.5"
                  >
                    {savingNote ? 'Saving…' : 'Save note'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {notesLoading ? (
            <p className="text-xs text-[#6b6580] col-span-full">Loading notes…</p>
          ) : notes.length === 0 && !isAddingNote ? (
            <p className="text-sm col-span-full">Nothing here yet — jot down a quick note.</p>
          ) : (
            notes.map((note) => <NoteTile key={note._id} note={note} onDelete={() => onDeleteNote(note._id)} />)
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[#3d3651] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-[#f5f5f5]">General study links</h2>
          {!isAddingLink && (
            <button
              type="button"
              onClick={() => setIsAddingLink(true)}
              className="flex items-center gap-1 text-sm text-[#6d28d9] hover:opacity-70 cursor-pointer"
            >
              <MdAdd size={16} /> Add link
            </button>
          )}
        </div>

        {isAddingLink && (
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={newLinkTitle}
              onChange={(event) => setNewLinkTitle(event.target.value)}
              placeholder="Title"
              autoFocus
              className="flex-1 rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
            />
            <input
              type="url"
              value={newLinkUrl}
              onChange={(event) => setNewLinkUrl(event.target.value)}
              placeholder="https://..."
              className="flex-1 rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddingLink(false)}
                className="text-xs text-[#b0b0b0] hover:opacity-70 px-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onAddLink}
                disabled={savingLink || !newLinkTitle.trim() || !newLinkUrl.trim()}
                className="text-xs font-medium text-white bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-50 rounded-md px-3 py-2"
              >
                {savingLink ? 'Saving…' : 'Add'}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {linksLoading ? (
            <p className="text-xs text-[#6b6580]">Loading links…</p>
          ) : links.length === 0 ? (
            <p className="text-xs text-[#6b6580]">No general links yet.</p>
          ) : (
            links.map((link) => (
              <div key={link._id} className="flex items-center justify-between gap-2">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-[#f5f5f5] hover:text-[#6d28d9] truncate"
                >
                  <MdLink size={16} className="text-[#b0b0b0] shrink-0" />
                  <span className="truncate">{link.title}</span>
                </a>
                <button
                  type="button"
                  onClick={() => onDeleteLink(link._id)}
                  aria-label="Delete link"
                  className="text-[#6b6580] hover:text-red-400 shrink-0 cursor-pointer"
                >
                  <MdClose size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {todayMood && (
    <MoodChecker todayMood={todayMood} moodLoading={moodLoading} onLogMood={onLogMood} />
  )}
    </div>
  )
}

interface CoursePanelProps {
  course: Course
  topics: Topic[]
  topicsLoading: boolean
  isAddingTopic: boolean
  setIsAddingTopic: (value: boolean) => void
  newTopicTitle: string
  setNewTopicTitle: (value: string) => void
  newTopicResource: string
  setNewTopicResource: (value: string) => void
  newTopicStatus: TopicStatus
  setNewTopicStatus: (value: TopicStatus) => void
  savingTopic: boolean
  onAddTopic: () => void
  onToggleComplete: (topic: Topic) => void
  onChangeStatus: (topic: Topic, status: TopicStatus) => void
  onDeleteTopic: (id: string) => void
  onEditCourse: () => void
  isAddingAssessment: boolean
setIsAddingAssessment: (v: boolean) => void
newAssessmentTitle: string
setNewAssessmentTitle: (v: string) => void
newAssessmentDueDate: string
setNewAssessmentDueDate: (v: string) => void
newAssessmentWeight: string
setNewAssessmentWeight: (v: string) => void
savingAssessment: boolean
onAddAssessment: () => void
}

function CoursePanel({
  course,
  topics,
  topicsLoading,
  isAddingTopic,
  setIsAddingTopic,
  newTopicTitle,
  setNewTopicTitle,
  newTopicResource,
  setNewTopicResource,
  newTopicStatus,
  setNewTopicStatus,
  savingTopic,
  onAddTopic,
  onToggleComplete,
  onChangeStatus,
  onDeleteTopic,
  onEditCourse,
  isAddingAssessment,
  setIsAddingAssessment,
  newAssessmentTitle,
  newAssessmentWeight,
  newAssessmentDueDate,
  setNewAssessmentDueDate,
  setNewAssessmentTitle,
  setNewAssessmentWeight,
  onAddAssessment,
  savingAssessment,

}: CoursePanelProps) {
  const caPercent = course.gradingScheme.continuousAssessment
  const examPercent = course.gradingScheme.exam

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-[#3d3651] p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="group flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-[#f5f5f5]">{course.name}</h2>
            <button
              type="button"
              onClick={onEditCourse}
              className="opacity-0 sm:group-hover:opacity-100 text-[#b0b0b0] hover:text-[#6d28d9] transition-opacity cursor-pointer"
              aria-label="Edit course"
            >
              <MdEdit size={18} />
            </button>
          </div>
            <p className="text-sm text-[#b0b0b0] mt-1 capitalize">
              {course.difficulty} difficulty · {course.creditLoad} credits · target {course.targetScore}%
            </p>
          </div>
          <span className="w-4 h-4 rounded-full mt-1 shrink-0" style={{ backgroundColor: course.themeColor }} />
        </div>

        <div>
          <div className="h-2 rounded-full border border-[#3d3651] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${caPercent}%`, backgroundColor: course.themeColor }} />
          </div>
          <p className="text-xs text-[#b0b0b0] mt-1.5">CA {caPercent}% · Exam {examPercent}%</p>
        </div>
      </div>

<div className="rounded-lg border border-[#3d3651] p-5">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-semibold text-[#f5f5f5]">Assessments</h3>
    {!isAddingAssessment && (
      <button
        type="button"
        onClick={() => setIsAddingAssessment(true)}
        className="flex items-center gap-1 text-sm text-[#6d28d9] hover:opacity-70"
      >
        <MdAdd size={16} /> Add assessment
      </button>
    )}
  </div>

  {isAddingAssessment && (
    <div className="rounded-lg border border-dashed border-[#3d3651] p-4 mb-4 flex flex-col gap-3">
      <input
        type="text"
        value={newAssessmentTitle}
        onChange={(e) => setNewAssessmentTitle(e.target.value)}
        placeholder="e.g. Mid-semester test"
        autoFocus
        className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="date"
          value={newAssessmentDueDate}
          onChange={(e) => setNewAssessmentDueDate(e.target.value)}
          className="flex-1 rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-sm text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
        />
        <input
          type="number"
          value={newAssessmentWeight}
          onChange={(e) => setNewAssessmentWeight(e.target.value)}
          placeholder="Weight (%)"
          min={1}
          max={100}
          className="w-full sm:w-32 rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsAddingAssessment(false)}
          className="text-xs text-[#b0b0b0] hover:opacity-70 px-3 py-1.5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onAddAssessment}
          disabled={savingAssessment || !newAssessmentTitle.trim() || !newAssessmentDueDate || !newAssessmentWeight}
          className="text-xs font-medium text-white bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-50 rounded-md px-3 py-1.5"
        >
          {savingAssessment ? 'Saving…' : 'Add assessment'}
        </button>
      </div>
    </div>
  )}

  {course.assessments.length === 0 ? (
    <p className="text-xs text-[#6b6580]">No assessments added yet.</p>
  ) : (
    <div className="flex flex-col gap-2">
      {course.assessments.map((assessment) => (
        <div key={assessment._id} className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[#f5f5f5] truncate">{assessment.title}</span>
          <span className="text-[#b0b0b0] text-xs shrink-0 text-right">
            {new Date(assessment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {assessment.weight}%
            {assessment.scoreAchieved != null ? ` · scored ${assessment.scoreAchieved}%` : ''}
            {assessment.isCompleted ? ' · done' : ''}
          </span>
        </div>
      ))}
    </div>
  )}
</div>
      {course.studyLinks.length > 0 && (
        <div className="rounded-lg border border-[#3d3651] p-5">
          <h3 className="text-sm font-semibold text-[#f5f5f5] mb-3">Course links</h3>
          <div className="flex flex-col gap-2">
            {course.studyLinks.map((link) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-[#f5f5f5] hover:text-[#6d28d9] truncate"
              >
                <MdLink size={16} className="text-[#b0b0b0] shrink-0" />
                <span className="truncate">{link.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-[#3d3651] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#f5f5f5]">Topics</h3>
          {!isAddingTopic && (
            <button
              type="button"
              onClick={() => setIsAddingTopic(true)}
              className="flex items-center gap-1 text-sm text-[#6d28d9] hover:opacity-70"
            >
              <MdAdd size={16} /> Create topic
            </button>
          )}
        </div>

        {isAddingTopic && (
          <div className="rounded-lg border border-dashed border-[#3d3651] p-4 mb-4 flex flex-col gap-3">
            <input
              type="text"
              value={newTopicTitle}
              onChange={(event) => setNewTopicTitle(event.target.value)}
              placeholder="e.g. Pointer arithmetic"
              autoFocus
              className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={newTopicStatus}
                onChange={(event) => setNewTopicStatus(event.target.value as TopicStatus)}
                className="rounded-md border border-[#3d3651] px-3 py-2 text-sm text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
              >
                <option value="backlog">Backlog</option>
                <option value="scheduled">Scheduled</option>
                <option value="mastered">Mastered</option>
              </select>
              <input
                type="url"
                value={newTopicResource}
                onChange={(event) => setNewTopicResource(event.target.value)}
                placeholder="Resource link (optional)"
                className="flex-1 rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingTopic(false)}
                className="text-xs text-[#b0b0b0] hover:opacity-70 px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onAddTopic}
                disabled={savingTopic || !newTopicTitle.trim()}
                className="text-xs font-medium text-white bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-50 rounded-md px-3 py-1.5"
              >
                {savingTopic ? 'Saving…' : 'Add topic'}
              </button>
            </div>
          </div>
        )}

        {topicsLoading ? (
          <p className="text-xs text-[#6b6580]">Loading topics…</p>
        ) : topics.length === 0 ? (
          <p className="text-xs text-[#6b6580]">No topics yet — break this course down into pieces.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topics.map((topic) => (
              <div key={topic._id} className="flex items-center gap-3 rounded-md border border-[#3d3651] px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={topic.isCompleted}
                  onChange={() => onToggleComplete(topic)}
                  className="accent-[#6d28d9] shrink-0"
                />
                <span className={`flex-1 text-sm truncate ${topic.isCompleted ? 'text-[#6b6580] line-through' : 'text-[#f5f5f5]'}`}>
                  {topic.title}
                </span>
                {topic.resourceLink && (
                  <a
                    href={topic.resourceLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#b0b0b0] hover:text-[#6d28d9] shrink-0"
                    aria-label="Open resource"
                  >
                    <MdLink size={16} />
                  </a>
                )}
                <select
                  value={topic.status}
                  onChange={(event) => onChangeStatus(topic, event.target.value as TopicStatus)}
                  className="text-xs rounded-md border border-[#3d3651] px-2 py-1 text-[#f5f5f5] shrink-0"
                >
                  <option value="backlog">Backlog</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="mastered">Mastered</option>
                </select>
                <button
                  type="button"
                  onClick={() => onDeleteTopic(topic._id)}
                  aria-label="Delete topic"
                  className="text-[#6b6580] hover:text-red-400 shrink-0 cursor-pointer"
                >
                  <MdClose size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const Home = () => {
  const navigate = useNavigate()

  const [semester, setSemester] = useState<SemesterDoc | null>(null)
  const [loadingSemester, setLoadingSemester] = useState(true)
  const [semesterError, setSemesterError] = useState<string | null>(null)

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)


  const [topicsByCourse, setTopicsByCourse] = useState<Record<string, Topic[]>>({})
  const [topicsLoading, setTopicsLoading] = useState(false)

  const [notes, setNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteColor, setNewNoteColor] = useState('#6d28d9')
  const [savingNote, setSavingNote] = useState(false)

  const [links, setLinks] = useState<GeneralStudyLink[]>([])
  const [linksLoading, setLinksLoading] = useState(true)
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [savingLink, setSavingLink] = useState(false)

  const [isAddingTopic, setIsAddingTopic] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newTopicResource, setNewTopicResource] = useState('')
  const [newTopicStatus, setNewTopicStatus] = useState<TopicStatus>('backlog')
  const [savingTopic, setSavingTopic] = useState(false)

  const [todayMood, setTodayMood] = useState<MoodState | null>(null)
const [moodLoading, setMoodLoading] = useState(true)

const [isAddingAssessment, setIsAddingAssessment] = useState(false)
const [newAssessmentTitle, setNewAssessmentTitle] = useState('')
const [newAssessmentDueDate, setNewAssessmentDueDate] = useState('')
const [newAssessmentWeight, setNewAssessmentWeight] = useState('')
const [savingAssessment, setSavingAssessment] = useState(false)

  const [now, setNow] = useState(new Date())
const { user, loading: authLoading, preferences } = useAuth();

const ADAPTIVE_DISABILITIES = [
  'Focus & Attention',
  'Anxiety & Overwhelm',
  'Reading & Writing',
  'Energy & Pacing',
]

const showRecommendations = preferences?.disabilities?.some((d) =>
  ADAPTIVE_DISABILITIES.includes(d)
) ?? false

useEffect(() => {
  const auth = getAuth()
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) return
    setMoodLoading(true)
    moodApi.checkTodayStatus()
      .then((res) => setTodayMood(res.mood))
      .catch(console.error)
      .finally(() => setMoodLoading(false))
  })
  return () => unsubscribe()
}, [])
const handleLogMood = async (mood: MoodState) => {
  try {
    await moodApi.logMood({ mood })
    pendo.track("mood_logged", {
      mood_state: mood
    })
    setTodayMood(mood)
  } catch (err) {
    console.error('Could not save mood:', err)
  }
}

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (authLoading) return; 
    if (!user) {
      navigate('/auth');
      return;
    }
    const loadSemester = async () => {
      setLoadingSemester(true)
      setSemesterError(null)
      try {
        const semesters = await semesterApi.getAll()
        if (semesters.length === 0) {
          return
        }
        const today = new Date()
        const active = semesters.find((s) => new Date(s.startDate) <= today && today <= new Date(s.endDate))
        setSemester(active || semesters[0])
      } catch (err: any) {
        console.error('Failed to load semester:', err)
        setSemesterError(err.message || 'Could not load your semester.')
      } finally {
        setLoadingSemester(false)
      }
    }
    loadSemester()
  }, [navigate, authLoading, user])

useEffect(() => {
    if (!semester) return

    const loadExtras = () => {
      // Set both to loading initially
      setNotesLoading(true)
      setLinksLoading(true)


      noteApi.getBySemester(semester._id)
        .then((notesData) => setNotes(notesData))
        .catch((err) => console.error('Failed to load notes:', err))
        .finally(() => setNotesLoading(false))

    
      generalStudyLinkApi.getBySemester(semester._id)
        .then((linksData) => setLinks(linksData))
        .catch((err) => console.error('Failed to load links:', err))
        .finally(() => setLinksLoading(false))
    }

    loadExtras()
  }, [semester])

  useEffect(() => {
    if (!selectedCourseId || topicsByCourse[selectedCourseId]) return

    const loadTopics = async () => {
      setTopicsLoading(true)
      try {
        const data = await topicApi.getByCourse(selectedCourseId)
        setTopicsByCourse((prev) => ({ ...prev, [selectedCourseId]: data }))
      } catch (err) {
        console.error('Failed to load topics:', err)
      } finally {
        setTopicsLoading(false)
      }
    }
    loadTopics()
  }, [selectedCourseId, topicsByCourse])

    const handleSelectCourse = (courseId: string | null) => {
      if (courseId) {
        setSelectedCourseId(courseId)
      } else {
        setSelectedCourseId(null)
      }
      setIsAddingTopic(false)
      setIsAddingAssessment(false)
    }

  const handleAddNote = async () => {
    if (!semester || !newNoteContent.trim()) return
    setSavingNote(true)
    try {
      const note = await noteApi.create({
        semesterId: semester._id,
        content: newNoteContent.trim(),
        color: newNoteColor,
      })
      pendo.track("note_created", {
        semester_id: semester._id,
        note_color: newNoteColor,
        content_length: newNoteContent.trim().length
      })
      setNotes((prev) => [note, ...prev])
      setNewNoteContent('')
      setIsAddingNote(false)
    } catch (err) {
      console.error('Failed to save note:', err)
    } finally {
      setSavingNote(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      await noteApi.remove(id)
      pendo.track("note_deleted", {
        note_id: id
      })
      setNotes((prev) => prev.filter((note) => note._id !== id))
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  const handleAddLink = async () => {
    if (!semester || !newLinkTitle.trim() || !newLinkUrl.trim()) return
    setSavingLink(true)
    try {
      const link = await generalStudyLinkApi.create({
        semesterId: semester._id,
        title: newLinkTitle.trim(),
        url: newLinkUrl.trim(),
      })
      let linkDomain = "unknown"
      try { linkDomain = new URL(newLinkUrl.trim()).hostname } catch { /* ignore */ }
      pendo.track("study_link_added", {
        semester_id: semester._id,
        link_title: newLinkTitle.trim(),
        link_url_domain: linkDomain
      })
      setLinks((prev) => [link, ...prev])
      setNewLinkTitle('')
      setNewLinkUrl('')
      setIsAddingLink(false)
    } catch (err) {
      console.error('Failed to save link:', err)
    } finally {
      setSavingLink(false)
    }
  }

  const handleDeleteLink = async (id: string) => {
    try {
      await generalStudyLinkApi.remove(id)
      pendo.track("study_link_deleted", {
        link_id: id
      })
      setLinks((prev) => prev.filter((link) => link._id !== id))
    } catch (err) {
      console.error('Failed to delete link:', err)
    }
  }

  const handleAddTopic = async () => {
    if (!semester || !selectedCourseId || !newTopicTitle.trim()) return
    setSavingTopic(true)
    try {
      const topic = await topicApi.create({
        semesterId: semester._id,
        courseId: selectedCourseId,
        title: newTopicTitle.trim(),
        status: newTopicStatus,
        resourceLink: newTopicResource.trim() || undefined,
      })
      pendo.track("topic_created", {
        course_id: selectedCourseId,
        semester_id: semester._id,
        topic_status: newTopicStatus,
        has_resource_link: Boolean(newTopicResource.trim())
      })
      setTopicsByCourse((prev) => ({
        ...prev,
        [selectedCourseId]: [...(prev[selectedCourseId] || []), topic],
      }))
      setNewTopicTitle('')
      setNewTopicResource('')
      setNewTopicStatus('backlog')
      setIsAddingTopic(false)
    } catch (err) {
      console.error('Failed to create topic:', err)
    } finally {
      setSavingTopic(false)
    }
  }

  const handleToggleTopicComplete = async (topic: Topic) => {
    if (!selectedCourseId) return
    try {
      const updated = await topicApi.update(topic._id, { isCompleted: !topic.isCompleted })
      if (!topic.isCompleted) {
        pendo.track("topic_completed", {
          course_id: selectedCourseId,
          topic_id: topic._id,
          topic_title: topic.title
        })
      }
      setTopicsByCourse((prev) => ({
        ...prev,
        [selectedCourseId]: prev[selectedCourseId].map((t) => (t._id === topic._id ? updated : t)),
      }))
      if (updated.isCompleted) celebrate()
    } catch (err) {
      console.error('Failed to update topic:', err)
    }
  }

  const handleChangeTopicStatus = async (topic: Topic, status: TopicStatus) => {
    if (!selectedCourseId) return
    try {
      const updated = await topicApi.update(topic._id, { status })
      pendo.track("topic_status_changed", {
        course_id: selectedCourseId,
        topic_id: topic._id,
        old_status: topic.status,
        new_status: status
      })
      setTopicsByCourse((prev) => ({
        ...prev,
        [selectedCourseId]: prev[selectedCourseId].map((t) => (t._id === topic._id ? updated : t)),
      }))
    } catch (err) {
      console.error('Failed to update topic status:', err)
    }
  }

  const handleAddAssessment = async () => {
  if (!semester || !selectedCourseId || !user?.uid || !newAssessmentTitle.trim() || !newAssessmentDueDate || !newAssessmentWeight) return
  setSavingAssessment(true)
  try {
    const updatedSemester = await assessmentApi.create(user.uid, selectedCourseId, {
      title: newAssessmentTitle.trim(),
      dueDate: newAssessmentDueDate,
      weight: Number(newAssessmentWeight),
    })
    setSemester(updatedSemester)
    setNewAssessmentTitle('')
    setNewAssessmentDueDate('')
    setNewAssessmentWeight('')
    setIsAddingAssessment(false)
  } catch (err) {
    console.error('Failed to create assessment:', err)
  } finally {
    setSavingAssessment(false)
  }
}

  const handleDeleteTopic = async (topicId: string) => {
    if (!selectedCourseId) return
    try {
      await topicApi.remove(topicId)
      pendo.track("topic_deleted", {
        course_id: selectedCourseId,
        topic_id: topicId
      })
      setTopicsByCourse((prev) => ({
        ...prev,
        [selectedCourseId]: prev[selectedCourseId].filter((t) => t._id !== topicId),
      }))
    } catch (err) {
      console.error('Failed to delete topic:', err)
    }
  }

  if (loadingSemester) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (semesterError || !semester) {
    return (
      <>
       <Navbar />
             <div className="min-h-screen flex items-center justify-center px-6">
       
        <div className="text-center flex flex-col gap-3">
          <p className="text-[#f5f5f5]">{semesterError || 'No semester found.'}</p>
        <button
        onClick={() => navigate('/create')} 
          className="w-full rounded-md p-5 bg-purple-600 text-white py-2 font-semibold disabled:opacity-50 hover:opacity-50 cursor:pointer"
        >
         Set up a semester
        </button>
        </div>
      </div>
      </>

    )
  }

  const selectedCourse = semester.courses.find((course) => course._id === selectedCourseId) || null

  return (
    <>
    <Navbar />
    <div className="min-h-screen px-6 sm:px-10 py-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="group flex items-center gap-2">
          <h1 className="text-4xl font-bold text-[#f5f5f5]">{semester.title}</h1>
          <button
            type="button"
            onClick={() => navigate(`/edit/${semester._id}`, { state: { semester } })}
            className="opacity-0 sm:group-hover:opacity-100 sm:opacity-0 text-[#b0b0b0] hover:text-[#6d28d9] transition-opacity cursor-pointer"
            aria-label="Edit semester"
          >
            <MdEdit size={20} />
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <MetaCard label="Start" value={formatDate(semester.startDate)} rotate="0" />
          <MetaCard label="End" value={formatDate(semester.endDate)} rotate="0" />
          <MetaCard label="Today" value={`${formatShortDate(now)} · ${formatTime(now)}`} rotate="0" />
        </div>
      </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-40 shrink-0 flex flex-col gap-3">

            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-2">
              <NotesTab 
                isSelected={selectedCourseId === null}
                onClick={() => handleSelectCourse(null)}
              />
              {semester.courses.map((course) => (
                <CourseTab
                  key={course._id}
                  course={course}
                  isSelected={selectedCourseId === course._id}
                  onClick={() => handleSelectCourse(course._id as string)}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {selectedCourse ? (
              <CoursePanel
                course={selectedCourse}
                topics={topicsByCourse[selectedCourse._id as string] || []}
                topicsLoading={topicsLoading}
                isAddingTopic={isAddingTopic}
                setIsAddingTopic={setIsAddingTopic}
                newTopicTitle={newTopicTitle}
                setNewTopicTitle={setNewTopicTitle}
                newTopicResource={newTopicResource}
                setNewTopicResource={setNewTopicResource}
                newTopicStatus={newTopicStatus}
                setNewTopicStatus={setNewTopicStatus}
                savingTopic={savingTopic}
                onAddTopic={handleAddTopic}
                onToggleComplete={handleToggleTopicComplete}
                onChangeStatus={handleChangeTopicStatus}
                onDeleteTopic={handleDeleteTopic}
                onEditCourse={() => setEditingCourse(selectedCourse)}
                isAddingAssessment={isAddingAssessment}
                setIsAddingAssessment={setIsAddingAssessment}
                newAssessmentTitle={newAssessmentTitle}
                setNewAssessmentTitle={setNewAssessmentTitle}
                newAssessmentDueDate={newAssessmentDueDate}
                setNewAssessmentDueDate={setNewAssessmentDueDate}
                newAssessmentWeight={newAssessmentWeight}
                setNewAssessmentWeight={setNewAssessmentWeight}
                savingAssessment={savingAssessment}
                onAddAssessment={handleAddAssessment}
              />
            ) : (

          <HomePanel
          notes={notes}
          notesLoading={notesLoading}
          isAddingNote={isAddingNote}
          setIsAddingNote={setIsAddingNote}
          newNoteContent={newNoteContent}
          setNewNoteContent={setNewNoteContent}
          newNoteColor={newNoteColor}
          setNewNoteColor={setNewNoteColor}
          savingNote={savingNote}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          links={links}
          linksLoading={linksLoading}
          isAddingLink={isAddingLink}
          setIsAddingLink={setIsAddingLink}
          newLinkTitle={newLinkTitle}
          setNewLinkTitle={setNewLinkTitle}
          newLinkUrl={newLinkUrl}
          setNewLinkUrl={setNewLinkUrl}
          savingLink={savingLink}
          onAddLink={handleAddLink}
          onDeleteLink={handleDeleteLink}
          todayMood={todayMood}
          moodLoading={moodLoading}
          onLogMood={handleLogMood}
        />
            )}
          </div>

          {editingCourse && user?.uid && (
            <CourseEditModal
              course={editingCourse}
              userId={user?.uid}
              onClose={() => setEditingCourse(null)}
              onSaved={(updatedSemester) => setSemester(updatedSemester)}
            />
          )}
        </div>
      </div>
    </div>
    </>
  )
}

export default Home