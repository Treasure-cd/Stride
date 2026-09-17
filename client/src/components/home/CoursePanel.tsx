import { PlusIcon, XIcon, LinkIcon, PencilSimpleIcon } from '../../lib/icons'
import type { Course, Topic, TopicStatus } from '../../lib/api'

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
  setIsAddingAssessment: (value: boolean) => void
  newAssessmentTitle: string
  setNewAssessmentTitle: (value: string) => void
  newAssessmentDueDate: string
  setNewAssessmentDueDate: (value: string) => void
  newAssessmentWeight: string
  setNewAssessmentWeight: (value: string) => void
  savingAssessment: boolean
  onAddAssessment: () => void
}

export default function CoursePanel({
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
  setNewAssessmentTitle,
  newAssessmentDueDate,
  setNewAssessmentDueDate,
  newAssessmentWeight,
  setNewAssessmentWeight,
  savingAssessment,
  onAddAssessment,
}: CoursePanelProps) {
  const caPercent = course.gradingScheme.continuousAssessment
  const examPercent = course.gradingScheme.exam

  return (
    <div className="flex flex-col gap-6">
      {/* Course Overview Card */}
      <div className="rounded-xl bg-(--bg-elevated) border border-(--border-subtle) p-6 flex flex-col gap-5 shadow-xs">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="group flex items-center gap-3">
              <h2 className="text-2xl font-bold text-(--text-h) tracking-tight">{course.name}</h2>
              <button
                type="button"
                onClick={onEditCourse}
                className="p-1 rounded-md text-(--text) opacity-40 hover:opacity-100 hover:text-(--accent) sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer"
                aria-label="Edit course"
              >
                <PencilSimpleIcon size={18} />
              </button>
            </div>
            <p className="text-sm font-medium text-(--text) opacity-60 mt-1 capitalize">
              {course.difficulty} difficulty · {course.creditLoad} credits · target {course.targetScore}%
            </p>
          </div>
          <span 
            className="w-4 h-4 rounded-full mt-1.5 shrink-0 ring-4 ring-(--bg)" 
            style={{ backgroundColor: course.themeColor }} 
          />
        </div>

        <div>
          <div className="h-2.5 rounded-full bg-(--bg) border border-(--border-subtle) overflow-hidden flex">
            <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${caPercent}%`, backgroundColor: course.themeColor }} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-(--text) opacity-50 mt-2">
            CA {caPercent}% <span className="mx-1 opacity-40">·</span> Exam {examPercent}%
          </p>
        </div>
      </div>

      {/* Assessments Card */}
      <div className="rounded-xl bg-(--bg-elevated) border border-(--border-subtle) p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-(--text-h)">Assessments</h3>
          {!isAddingAssessment && (
            <button
              type="button"
              onClick={() => setIsAddingAssessment(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--accent) hover:opacity-75 transition-opacity cursor-pointer"
            >
              <PlusIcon size={15} /> Add assessment
            </button>
          )}
        </div>

        {isAddingAssessment && (
          <div className="rounded-lg bg-(--bg)/60 border border-(--border-subtle) p-4 mb-4 flex flex-col gap-3">
            <input
              type="text"
              value={newAssessmentTitle}
              onChange={(e) => setNewAssessmentTitle(e.target.value)}
              placeholder="e.g. Mid-semester test"
              autoFocus
              className="w-full rounded-lg bg-(--bg) border border-(--input-border) px-3 py-2 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
            />
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="date"
                value={newAssessmentDueDate}
                onChange={(e) => setNewAssessmentDueDate(e.target.value)}
                className="flex-1 rounded-lg bg-(--bg) border border-(--input-border) px-3 py-2 text-sm text-(--text-h) focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none [color-scheme:dark]"
              />
              <input
                type="number"
                value={newAssessmentWeight}
                onChange={(e) => setNewAssessmentWeight(e.target.value)}
                placeholder="Weight (%)"
                min={1}
                max={100}
                className="w-full sm:w-32 rounded-lg bg-(--bg) border border-(--input-border) px-3 py-2 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsAddingAssessment(false)}
                className="text-xs text-(--text) opacity-60 hover:opacity-100 px-3 py-2 transition-opacity cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onAddAssessment}
                disabled={savingAssessment || !newAssessmentTitle.trim() || !newAssessmentDueDate || !newAssessmentWeight}
                className="text-xs font-medium text-white bg-(--accent) hover:brightness-110 disabled:opacity-50 rounded-lg px-3.5 py-2 transition-all cursor-pointer shadow-xs"
              >
                {savingAssessment ? 'Saving…' : 'Add assessment'}
              </button>
            </div>
          </div>
        )}

        {course.assessments.length === 0 ? (
          <p className="text-sm text-(--text) opacity-50 py-1">No assessments added yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {course.assessments.map((assessment) => (
              <div key={assessment._id} className="flex items-center justify-between gap-3 text-sm px-3 py-2.5 rounded-lg bg-(--bg)/40 border border-(--border-subtle)">
                <span className="text-(--text-h) font-medium truncate">{assessment.title}</span>
                <span className="text-(--text) opacity-60 text-xs shrink-0 text-right font-medium">
                  {new Date(assessment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {assessment.weight}%
                  {assessment.scoreAchieved != null ? ` · scored ${assessment.scoreAchieved}%` : ''}
                  {assessment.isCompleted && <span className="ml-1 text-(--accent)">· done</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Links Card */}
      {course.studyLinks.length > 0 && (
        <div className="rounded-xl bg-(--bg-elevated) border border-(--border-subtle) p-5 md:p-6">
          <h3 className="text-base font-semibold text-(--text-h) mb-4">Course links</h3>
          <div className="flex flex-col gap-1.5">
            {course.studyLinks.map((link) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-(--bg)/60 text-sm text-(--text) hover:text-(--text-h) truncate transition-colors"
              >
                <LinkIcon size={15} className="text-(--text) opacity-40 group-hover:text-(--accent) group-hover:opacity-100 shrink-0 transition-colors" />
                <span className="truncate font-normal">{link.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Topics Card */}
      <div className="rounded-xl bg-(--bg-elevated) border border-(--border-subtle) p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-(--text-h)">Topics</h3>
          {!isAddingTopic && (
            <button
              type="button"
              onClick={() => setIsAddingTopic(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--accent) hover:opacity-75 transition-opacity cursor-pointer"
            >
              <PlusIcon size={15} /> Create topic
            </button>
          )}
        </div>

        {isAddingTopic && (
          <div className="rounded-lg bg-(--bg)/60 border border-(--border-subtle) p-4 mb-4 flex flex-col gap-3">
            <input
              type="text"
              value={newTopicTitle}
              onChange={(event) => setNewTopicTitle(event.target.value)}
              placeholder="e.g. Pointer arithmetic"
              autoFocus
              className="w-full rounded-lg bg-(--bg) border border-(--input-border) px-3 py-2 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
            />
            <div className="flex flex-col sm:flex-row gap-2.5">
              <select
                value={newTopicStatus}
                onChange={(event) => setNewTopicStatus(event.target.value as TopicStatus)}
                className="rounded-lg bg-(--bg) border border-(--input-border) px-3 py-2 text-sm text-(--text-h) focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
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
                className="flex-1 rounded-lg bg-(--bg) border border-(--input-border) px-3 py-2 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsAddingTopic(false)}
                className="text-xs text-(--text) opacity-60 hover:opacity-100 px-3 py-2 transition-opacity cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onAddTopic}
                disabled={savingTopic || !newTopicTitle.trim()}
                className="text-xs font-medium text-white bg-(--accent) hover:brightness-110 disabled:opacity-50 rounded-lg px-3.5 py-2 transition-all cursor-pointer shadow-xs"
              >
                {savingTopic ? 'Saving…' : 'Add topic'}
              </button>
            </div>
          </div>
        )}

        {topicsLoading ? (
          <p className="text-sm text-(--text) opacity-50 py-1">Loading topics…</p>
        ) : topics.length === 0 ? (
          <p className="text-sm text-(--text) opacity-50 py-1">No topics yet — break this course down into pieces.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topics.map((topic) => (
              <div key={topic._id} className="group flex items-center gap-3 rounded-lg bg-(--bg)/40 border border-(--border-subtle) px-3.5 py-3 hover:bg-(--bg)/80 transition-colors">
                <input
                  type="checkbox"
                  checked={topic.isCompleted}
                  onChange={() => onToggleComplete(topic)}
                  className="accent-(--accent) w-4 h-4 rounded cursor-pointer shrink-0"
                />
                <span className={`flex-1 text-sm truncate transition-opacity ${topic.isCompleted ? 'text-(--text) opacity-50 line-through' : 'text-(--text-h) font-medium'}`}>
                  {topic.title}
                </span>
                
                {topic.resourceLink && (
                  <a
                    href={topic.resourceLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-md text-(--text) opacity-40 hover:opacity-100 hover:text-(--accent) transition-all shrink-0"
                    aria-label="Open resource"
                  >
                    <LinkIcon size={16} />
                  </a>
                )}
                
                <select
                  value={topic.status}
                  onChange={(event) => onChangeStatus(topic, event.target.value as TopicStatus)}
                  className="text-xs font-medium rounded-md bg-(--bg) border border-(--input-border) px-2 py-1.5 text-(--text-h) focus:border-(--accent) outline-none shrink-0"
                >
                  <option value="backlog">Backlog</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="mastered">Mastered</option>
                </select>
                
                <button
                  type="button"
                  onClick={() => onDeleteTopic(topic._id)}
                  aria-label="Delete topic"
                  className="p-1 rounded-md text-(--text) opacity-40 hover:opacity-100 hover:text-red-400 transition-all shrink-0 cursor-pointer"
                >
                  <XIcon size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}