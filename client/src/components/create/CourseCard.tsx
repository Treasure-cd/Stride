import { PlusIcon, XIcon, TrashIcon, CaretUpIcon, CaretDownIcon, LinkIcon } from '../../lib/icons'
import type { AssessmentFormState, StudyLinkFormState, CourseFormState, Difficulty } from '../../types/semester'

interface CourseCardProps {
  course: CourseFormState
  index: number
  canRemove: boolean
  fieldErrors: Record<string, string>
  onUpdate: (localId: string, patch: Partial<CourseFormState>) => void
  onRemove: (localId: string) => void
  onToggleExpand: (localId: string) => void
  onAddAssessment: (courseId: string) => void
  onUpdateAssessment: (courseId: string, assessmentId: string, patch: Partial<AssessmentFormState>) => void
  onRemoveAssessment: (courseId: string, assessmentId: string) => void
  onAddStudyLink: (courseId: string) => void
  onUpdateStudyLink: (courseId: string, linkId: string, patch: Partial<StudyLinkFormState>) => void
  onRemoveStudyLink: (courseId: string, linkId: string) => void
}

const CourseCard = ({
  course,
  index,
  canRemove,
  fieldErrors,
  onUpdate,
  onRemove,
  onToggleExpand,
  onAddAssessment,
  onUpdateAssessment,
  onRemoveAssessment,
  onAddStudyLink,
  onUpdateStudyLink,
  onRemoveStudyLink,
}: CourseCardProps) => {
  const gradingTotal = (Number(course.continuousAssessment) || 0) + (Number(course.exam) || 0)
  const gradingBalanced = gradingTotal === 100

  return (
    <div className="rounded-xl bg-(--bg-elevated) border border-(--border-subtle) overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => onToggleExpand(course.localId)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-(--bg)/40 transition-colors cursor-pointer"
        aria-expanded={course.isExpanded}
      >
        <div className="flex items-center gap-3.5">
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-(--bg-elevated)"
            style={{ backgroundColor: course.themeColor }}
          />
          <div>
            <h3 className="font-semibold text-(--text-h)">{course.name.trim() || `Course ${index + 1}`}</h3>
            <p className="text-xs text-(--text) opacity-65 mt-0.5 capitalize">{course.difficulty} difficulty</p>
          </div>
        </div>
        {course.isExpanded ? (
          <CaretUpIcon size={20} className="text-(--text) opacity-60 shrink-0" />
        ) : (
          <CaretDownIcon size={20} className="text-(--text) opacity-60 shrink-0" />
        )}
      </button>

      {course.isExpanded && (
        <div className="px-5 pb-6 flex flex-col gap-6 border-t border-(--border-subtle) pt-5">
          {/* Main Course Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-(--text) opacity-80" htmlFor={`name-${course.localId}`}>
                Course name
              </label>
              <input
                id={`name-${course.localId}`}
                type="text"
                value={course.name}
                onChange={(e) => onUpdate(course.localId, { name: e.target.value })}
                placeholder="e.g. Organic Chemistry"
                className="w-full rounded-lg bg-(--bg) border border-(--input-border) px-3.5 py-2 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
              />
              {fieldErrors[`${course.localId}-name`] && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors[`${course.localId}-name`]}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-(--text) opacity-80" htmlFor={`credit-${course.localId}`}>
                Credit load
              </label>
              <input
                id={`credit-${course.localId}`}
                type="number"
                min="0"
                step="0.5"
                value={course.creditLoad}
                onChange={(e) => onUpdate(course.localId, { creditLoad: e.target.value })}
                placeholder="e.g. 3"
                className="w-full rounded-lg bg-(--bg) border border-(--input-border) px-3.5 py-2 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
              />
              {fieldErrors[`${course.localId}-creditLoad`] && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors[`${course.localId}-creditLoad`]}</p>
              )}
            </div>
          </div>

          {/* Difficulty, Target Score, Theme Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-(--text) opacity-80" htmlFor={`difficulty-${course.localId}`}>
                Difficulty
              </label>
              <select
                id={`difficulty-${course.localId}`}
                value={course.difficulty}
                onChange={(e) => onUpdate(course.localId, { difficulty: e.target.value as Difficulty })}
                className="w-full rounded-lg bg-(--bg) border border-(--input-border) px-3 py-2 text-sm text-(--text-h) focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-(--text) opacity-80" htmlFor={`target-${course.localId}`}>
                Target score (%)
              </label>
              <input
                id={`target-${course.localId}`}
                type="number"
                min="0"
                max="100"
                value={course.targetScore}
                onChange={(e) => onUpdate(course.localId, { targetScore: e.target.value })}
                className="w-full rounded-lg bg-(--bg) border border-(--input-border) px-3.5 py-2 text-sm text-(--text-h) focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
              />
              {fieldErrors[`${course.localId}-targetScore`] && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors[`${course.localId}-targetScore`]}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-(--text) opacity-80" htmlFor={`color-${course.localId}`}>
                Theme color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`color-${course.localId}`}
                  type="color"
                  value={course.themeColor}
                  onChange={(e) => onUpdate(course.localId, { themeColor: e.target.value })}
                  className="h-9 w-10 rounded-md border border-(--input-border) bg-(--bg) p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={course.themeColor}
                  onChange={(e) => onUpdate(course.localId, { themeColor: e.target.value })}
                  className="w-full rounded-lg bg-(--bg) border border-(--input-border) px-3 py-2 text-sm text-(--text-h) focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Grading Breakdown */}
          <div className="p-4 rounded-lg bg-(--bg)/60 border border-(--border-subtle)">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-(--text) opacity-80">Grading breakdown</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={course.continuousAssessment}
                  onChange={(e) => onUpdate(course.localId, { continuousAssessment: e.target.value })}
                  aria-label="Continuous assessment percentage"
                  className="w-full rounded-lg bg-(--bg) border border-(--input-border) px-3 py-2 text-sm text-(--text-h) focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
                />
                <p className="text-xs text-(--text) opacity-65 mt-1.5">Continuous assessment %</p>
              </div>
              <span className="text-(--text) opacity-40 font-semibold pt-1">+</span>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={course.exam}
                  onChange={(e) => onUpdate(course.localId, { exam: e.target.value })}
                  aria-label="Exam percentage"
                  className="w-full rounded-lg bg-(--bg) border border-(--input-border) px-3 py-2 text-sm text-(--text-h) focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
                />
                <p className="text-xs text-(--text) opacity-65 mt-1.5">Exam %</p>
              </div>
            </div>
            <p className={`text-xs mt-2.5 ${gradingBalanced ? 'text-(--text) opacity-65' : 'text-red-400 font-medium'}`}>
              {gradingBalanced ? 'Adds up to 100%.' : `Currently totals ${gradingTotal}% — should be 100%.`}
            </p>
          </div>

          {/* Assessments */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-(--text-h)">Assessments</p>
              <button
                type="button"
                onClick={() => onAddAssessment(course.localId)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-(--accent) hover:opacity-75 transition-opacity cursor-pointer"
              >
                <PlusIcon size={15} /> Add assessment
              </button>
            </div>

            {course.assessments.length === 0 && (
              <p className="text-xs text-(--text) opacity-50 py-1">No assessments yet — add quizzes, CAs, or exams to track.</p>
            )}

            <div className="flex flex-col gap-2.5">
              {course.assessments.map((assessment) => (
                <div key={assessment.localId} className="p-3.5 rounded-lg bg-(--bg)/60 border border-(--border-subtle) flex flex-col gap-2.5">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={assessment.title}
                        onChange={(e) => onUpdateAssessment(course.localId, assessment.localId, { title: e.target.value })}
                        placeholder="Assessment title"
                        className="rounded-md bg-(--bg) border border-(--input-border) px-2.5 py-1.5 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) outline-none"
                      />
                      <input
                        type="date"
                        value={assessment.dueDate}
                        onChange={(e) => onUpdateAssessment(course.localId, assessment.localId, { dueDate: e.target.value })}
                        className="rounded-md bg-(--bg) border border-(--input-border) px-2.5 py-1.5 text-sm text-(--text-h) focus:border-(--accent) outline-none [color-scheme:dark]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveAssessment(course.localId, assessment.localId)}
                      className="text-(--text) opacity-50 hover:opacity-100 hover:text-red-400 p-1.5 transition-colors shrink-0 cursor-pointer"
                      aria-label="Remove assessment"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={assessment.weight}
                      onChange={(e) => onUpdateAssessment(course.localId, assessment.localId, { weight: e.target.value })}
                      placeholder="Weight %"
                      className="rounded-md bg-(--bg) border border-(--input-border) px-2.5 py-1.5 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={assessment.scoreAchieved}
                      onChange={(e) => onUpdateAssessment(course.localId, assessment.localId, { scoreAchieved: e.target.value })}
                      placeholder="Score (optional)"
                      className="rounded-md bg-(--bg) border border-(--input-border) px-2.5 py-1.5 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) outline-none"
                    />
                    <label className="flex items-center gap-2 text-xs text-(--text) opacity-80 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={assessment.isCompleted}
                        onChange={(e) => onUpdateAssessment(course.localId, assessment.localId, { isCompleted: e.target.checked })}
                        className="accent-(--accent) w-4 h-4 rounded cursor-pointer"
                      />
                      Completed
                    </label>
                  </div>
                  {(fieldErrors[`${assessment.localId}-title`] ||
                    fieldErrors[`${assessment.localId}-dueDate`] ||
                    fieldErrors[`${assessment.localId}-weight`]) && (
                    <p className="text-xs text-red-400">
                      {fieldErrors[`${assessment.localId}-title`] ||
                        fieldErrors[`${assessment.localId}-dueDate`] ||
                        fieldErrors[`${assessment.localId}-weight`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Study Links */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-(--text-h)">Study links</p>
              <button
                type="button"
                onClick={() => onAddStudyLink(course.localId)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-(--accent) hover:opacity-75 transition-opacity cursor-pointer"
              >
                <PlusIcon size={15} /> Add link
              </button>
            </div>

            {course.studyLinks.length === 0 && (
              <p className="text-xs text-(--text) opacity-50 py-1">No links yet — drop in lecture notes, slides, or past papers.</p>
            )}

            <div className="flex flex-col gap-2">
              {course.studyLinks.map((link) => (
                <div key={link.localId} className="flex items-center gap-2">
                  <LinkIcon size={16} className="text-(--text) opacity-45 shrink-0" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => onUpdateStudyLink(course.localId, link.localId, { title: e.target.value })}
                      placeholder="Link title"
                      className="rounded-md bg-(--bg) border border-(--input-border) px-2.5 py-1.5 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) outline-none"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => onUpdateStudyLink(course.localId, link.localId, { url: e.target.value })}
                      placeholder="https://..."
                      className="rounded-md bg-(--bg) border border-(--input-border) px-2.5 py-1.5 text-sm text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveStudyLink(course.localId, link.localId)}
                    className="text-(--text) opacity-50 hover:opacity-100 hover:text-red-400 p-1.5 transition-colors shrink-0 cursor-pointer"
                    aria-label="Remove study link"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              ))}
            </div>

            {fieldErrors[`${course.localId}-links`] && (
              <p className="text-xs text-red-400">{fieldErrors[`${course.localId}-links`]}</p>
            )}
          </div>

          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(course.localId)}
              className="self-start inline-flex items-center gap-1.5 text-xs text-red-400 hover:opacity-75 transition-opacity cursor-pointer pt-2"
            >
              <TrashIcon size={15} /> Remove course
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default CourseCard