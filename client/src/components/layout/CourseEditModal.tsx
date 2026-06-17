import { useState } from 'react'
import { MdAdd, MdClose } from 'react-icons/md'
import { courseApi } from '../../lib/api'
import type { Course, SemesterDoc, UpdateCoursePayload } from '../../lib/api'

type Difficulty = 'low' | 'medium' | 'high'

interface AssessmentEditState {
  localId: string
  _id?: string
  title: string
  dueDate: string
  weight: string
  scoreAchieved: string
  isCompleted: boolean
}

interface StudyLinkEditState {
  localId: string
  _id?: string
  title: string
  url: string
}

let idCounter = 0
const generateId = () => `edit-${Date.now()}-${idCounter++}`
const toInputDate = (value: string) => value.slice(0, 10)

const buildAssessmentState = (course: Course): AssessmentEditState[] =>
  course.assessments.map((a) => ({
    localId: generateId(),
    _id: a._id,
    title: a.title,
    dueDate: toInputDate(a.dueDate),
    weight: String(a.weight),
    scoreAchieved: a.scoreAchieved != null ? String(a.scoreAchieved) : '',
    isCompleted: a.isCompleted,
  }))

const buildStudyLinkState = (course: Course): StudyLinkEditState[] =>
  course.studyLinks.map((link) => ({
    localId: generateId(),
    _id: link._id,
    title: link.title,
    url: link.url,
  }))

interface CourseEditModalProps {
  course: Course
  userId: string
  onClose: () => void
  onSaved: (updatedSemester: SemesterDoc) => void
}

function CourseEditModal({ course, userId, onClose, onSaved }: CourseEditModalProps) {
  const [name, setName] = useState(course.name)
  const [creditLoad, setCreditLoad] = useState(String(course.creditLoad))
  const [difficulty, setDifficulty] = useState<Difficulty>(course.difficulty)
  const [themeColor, setThemeColor] = useState(course.themeColor)
  const [targetScore, setTargetScore] = useState(String(course.targetScore))
  const [continuousAssessment, setContinuousAssessment] = useState(String(course.gradingScheme.continuousAssessment))
  const [exam, setExam] = useState(String(course.gradingScheme.exam))
  const [assessments, setAssessments] = useState<AssessmentEditState[]>(() => buildAssessmentState(course))
  const [studyLinks, setStudyLinks] = useState<StudyLinkEditState[]>(() => buildStudyLinkState(course))

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const gradingTotal = (Number(continuousAssessment) || 0) + (Number(exam) || 0)
  const gradingBalanced = gradingTotal === 100

  const addAssessment = () =>
    setAssessments((prev) => [
      ...prev,
      { localId: generateId(), title: '', dueDate: '', weight: '', scoreAchieved: '', isCompleted: false },
    ])

  const updateAssessment = (localId: string, patch: Partial<AssessmentEditState>) =>
    setAssessments((prev) => prev.map((a) => (a.localId === localId ? { ...a, ...patch } : a)))

  const removeAssessment = (localId: string) =>
    setAssessments((prev) => prev.filter((a) => a.localId !== localId))

  const addStudyLink = () =>
    setStudyLinks((prev) => [...prev, { localId: generateId(), title: '', url: '' }])

  const updateStudyLink = (localId: string, patch: Partial<StudyLinkEditState>) =>
    setStudyLinks((prev) => prev.map((link) => (link.localId === localId ? { ...link, ...patch } : link)))

  const removeStudyLink = (localId: string) =>
    setStudyLinks((prev) => prev.filter((link) => link.localId !== localId))

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!name.trim()) errors.name = 'Course name is required.'

    const credit = Number(creditLoad)
    if (!creditLoad || Number.isNaN(credit) || credit <= 0) errors.creditLoad = 'Enter a valid credit load.'

    const target = Number(targetScore)
    if (targetScore && (Number.isNaN(target) || target < 0 || target > 100)) {
      errors.targetScore = 'Target score must be between 0 and 100.'
    }

    if (!gradingBalanced) errors.grading = 'Continuous assessment and exam weight must add up to 100.'

    assessments.forEach((a) => {
      if (!a.title.trim()) errors[`${a.localId}-title`] = 'Assessment needs a title.'
      if (!a.dueDate) errors[`${a.localId}-dueDate`] = 'Pick a due date.'
      const weight = Number(a.weight)
      if (!a.weight || Number.isNaN(weight) || weight <= 0) errors[`${a.localId}-weight`] = 'Enter a valid weight.'
    })

    studyLinks.forEach((link) => {
      if (!link.title.trim() || !link.url.trim()) errors.links = 'Every study link needs a title and a URL.'
    })

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    setError(null)
    if (!validate()) {
      setError('Fix the highlighted fields before saving.')
      return
    }
    if (!course._id) {
      setError('This course is missing an id — try refreshing the page.')
      return
    }

    setIsSaving(true)

    const payload: UpdateCoursePayload = {
      name: name.trim(),
      creditLoad: Number(creditLoad),
      difficulty,
      themeColor,
      targetScore: Number(targetScore),
      gradingScheme: {
        continuousAssessment: Number(continuousAssessment),
        exam: Number(exam),
      },
      postExamReflection: course.postExamReflection,
      assessments: assessments.map((a) => ({
        ...(a._id ? { _id: a._id } : {}),
        title: a.title.trim(),
        dueDate: a.dueDate,
        weight: Number(a.weight),
        isCompleted: a.isCompleted,
        ...(a.scoreAchieved.trim() !== '' ? { scoreAchieved: Number(a.scoreAchieved) } : {}),
      })),
      studyLinks: studyLinks.map((link) => ({
        ...(link._id ? { _id: link._id } : {}),
        title: link.title.trim(),
        url: link.url.trim(),
      })),
    }

    try {
      const updatedSemester = await courseApi.update(userId, course._id, payload)
      onSaved(updatedSemester)
      onClose()
    } catch (err: any) {
      console.error('Error updating course:', err)
      setError(err.message || 'We had trouble saving this course. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-full overflow-y-auto rounded-lg border border-[#3d3651] bg-[#0d0b14] p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#f5f5f5]">Edit course</h2>
          <button type="button" onClick={onClose} className="text-[#b0b0b0] hover:text-[#f5f5f5]" aria-label="Close">
            <MdClose size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]">Course name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
            />
            {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]">Credit load</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={creditLoad}
              onChange={(e) => setCreditLoad(e.target.value)}
              className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
            />
            {fieldErrors.creditLoad && <p className="text-xs text-red-400 mt-1">{fieldErrors.creditLoad}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full rounded-md border border-[#3d3651] bg-[#0d0b14] px-3 py-2 text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]">Target score (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
            />
            {fieldErrors.targetScore && <p className="text-xs text-red-400 mt-1">{fieldErrors.targetScore}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]">Theme color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="h-9 w-10 rounded border border-[#3d3651] bg-transparent cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="block text-sm font-semibold mb-1 text-[#f5f5f5]">Grading breakdown</p>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="100"
                value={continuousAssessment}
                onChange={(e) => setContinuousAssessment(e.target.value)}
                className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
              />
              <p className="text-xs text-[#b0b0b0] mt-1">Continuous assessment %</p>
            </div>
            <span className="text-[#b0b0b0] pt-2.5">+</span>
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="100"
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
              />
              <p className="text-xs text-[#b0b0b0] mt-1">Exam %</p>
            </div>
          </div>
          <p className={`text-xs mt-2 ${gradingBalanced ? 'text-[#b0b0b0]' : 'text-red-400'}`}>
            {gradingBalanced ? 'Adds up to 100%.' : `Currently totals ${gradingTotal}% — should be 100%.`}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#f5f5f5]">Assessments</p>
            <button type="button" onClick={addAssessment} className="flex items-center gap-1 text-xs text-[#6d28d9] hover:opacity-70">
              <MdAdd size={16} /> Add assessment
            </button>
          </div>

          {assessments.length === 0 && <p className="text-xs text-[#6b6580]">No assessments yet.</p>}

          {assessments.map((a) => (
            <div key={a.localId} className="p-3 rounded-md border border-[#3d3651] flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={a.title}
                    onChange={(e) => updateAssessment(a.localId, { title: e.target.value })}
                    placeholder="Assessment title"
                    className="rounded-md border border-[#3d3651] bg-transparent px-2 py-1.5 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
                  />
                  <input
                    type="date"
                    value={a.dueDate}
                    onChange={(e) => updateAssessment(a.localId, { dueDate: e.target.value })}
                    className="rounded-md border border-[#3d3651] bg-transparent px-2 py-1.5 text-sm text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
                  />
                </div>
                <button type="button" onClick={() => removeAssessment(a.localId)} className="text-[#b0b0b0] hover:text-red-400 mt-1.5 shrink-0" aria-label="Remove assessment">
                  <MdClose size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={a.weight}
                  onChange={(e) => updateAssessment(a.localId, { weight: e.target.value })}
                  placeholder="Weight %"
                  className="rounded-md border border-[#3d3651] bg-transparent px-2 py-1.5 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={a.scoreAchieved}
                  onChange={(e) => updateAssessment(a.localId, { scoreAchieved: e.target.value })}
                  placeholder="Score (optional)"
                  className="rounded-md border border-[#3d3651] bg-transparent px-2 py-1.5 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
                />
                <label className="flex items-center gap-2 text-xs text-[#b0b0b0] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={a.isCompleted}
                    onChange={(e) => updateAssessment(a.localId, { isCompleted: e.target.checked })}
                    className="accent-[#6d28d9]"
                  />
                  Completed
                </label>
              </div>
              {(fieldErrors[`${a.localId}-title`] || fieldErrors[`${a.localId}-dueDate`] || fieldErrors[`${a.localId}-weight`]) && (
                <p className="text-xs text-red-400">
                  {fieldErrors[`${a.localId}-title`] || fieldErrors[`${a.localId}-dueDate`] || fieldErrors[`${a.localId}-weight`]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#f5f5f5]">Study links</p>
            <button type="button" onClick={addStudyLink} className="flex items-center gap-1 text-xs text-[#6d28d9] hover:opacity-70">
              <MdAdd size={16} /> Add link
            </button>
          </div>

          {studyLinks.length === 0 && <p className="text-xs text-[#6b6580]">No links yet.</p>}

          {studyLinks.map((link) => (
            <div key={link.localId} className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => updateStudyLink(link.localId, { title: e.target.value })}
                  placeholder="Link title"
                  className="rounded-md border border-[#3d3651] bg-transparent px-2 py-1.5 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateStudyLink(link.localId, { url: e.target.value })}
                  placeholder="https://..."
                  className="rounded-md border border-[#3d3651] bg-transparent px-2 py-1.5 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
                />
              </div>
              <button type="button" onClick={() => removeStudyLink(link.localId)} className="text-[#b0b0b0] hover:text-red-400 mt-1.5 shrink-0" aria-label="Remove study link">
                <MdClose size={16} />
              </button>
            </div>
          ))}

          {fieldErrors.links && <p className="text-xs text-red-400">{fieldErrors.links}</p>}
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">{error}</div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={isSaving} className="text-sm text-[#b0b0b0] hover:opacity-70 px-4 py-2">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="text-sm font-medium text-white bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-50 rounded-md px-4 py-2"
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseEditModal