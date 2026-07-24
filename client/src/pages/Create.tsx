import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth'
import { PlusIcon, XIcon, TrashIcon, CaretUpIcon, CaretDownIcon, LinkIcon, ArrowLeftIcon } from '../lib/icons'
import { semesterApi } from '../lib/api'
import { useParams } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import type { CreateSemesterPayload } from '../lib/api'
import type { SemesterDoc } from '../lib/api'
import type { AssessmentFormState, StudyLinkFormState, CourseFormState, Difficulty } from '../types/semester'

let idCounter = 0
const generateId = () => `id-${Date.now()}-${idCounter++}`

const createEmptyAssessment = (): AssessmentFormState => ({
  localId: generateId(),
  title: '',
  dueDate: '',
  weight: '',
  scoreAchieved: '',
  isCompleted: false,
})

const createEmptyStudyLink = (): StudyLinkFormState => ({
  localId: generateId(),
  title: '',
  url: '',
})

const createEmptyCourse = (): CourseFormState => ({
  localId: generateId(),
  name: '',
  creditLoad: '',
  difficulty: 'medium',
  themeColor: '#6d28d9',
  targetScore: '70',
  continuousAssessment: '30',
  exam: '70',
  assessments: [],
  studyLinks: [],
  isExpanded: true,
})

const Spinner = ({ size = 20 }: { size?: number }) => (
  <svg className="animate-spin text-white" style={{ height: size, width: size }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

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

function CourseCard({
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
}: CourseCardProps) {
  const gradingTotal = (Number(course.continuousAssessment) || 0) + (Number(course.exam) || 0)
  const gradingBalanced = gradingTotal === 100

  return (
    <div className="rounded-lg border border-[#3d3651] overflow-hidden">
      <button
        type="button"
        onClick={() => onToggleExpand(course.localId)}
        className="w-full flex items-center justify-between p-5 text-left"
        aria-expanded={course.isExpanded}
      >
        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: course.themeColor }} />
          <div>
            <h3 className="font-medium text-[#f5f5f5]">{course.name.trim() || `Course ${index + 1}`}</h3>
            <p className="text-xs text-[#b0b0b0] mt-0.5 capitalize">{course.difficulty} difficulty</p>
          </div>
        </div>
        {course.isExpanded ? (
          <CaretUpIcon size={22} className="text-[#b0b0b0] shrink-0" />
        ) : (
          <CaretDownIcon size={22} className="text-[#b0b0b0] shrink-0" />
        )}
      </button>

      {course.isExpanded && (
        <div className="px-5 pb-5 flex flex-col gap-5 border-t border-[#3d3651] pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]" htmlFor={`name-${course.localId}`}>
                Course name
              </label>
              <input
                id={`name-${course.localId}`}
                type="text"
                value={course.name}
                onChange={(e) => onUpdate(course.localId, { name: e.target.value })}
                placeholder="e.g. Organic Chemistry"
                className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
              />
              {fieldErrors[`${course.localId}-name`] && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors[`${course.localId}-name`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]" htmlFor={`credit-${course.localId}`}>
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
                className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
              />
              {fieldErrors[`${course.localId}-creditLoad`] && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors[`${course.localId}-creditLoad`]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]" htmlFor={`difficulty-${course.localId}`}>
                Difficulty
              </label>
              <select
                id={`difficulty-${course.localId}`}
                value={course.difficulty}
                onChange={(e) => onUpdate(course.localId, { difficulty: e.target.value as Difficulty })}
                className="w-full rounded-md border border-[#3d3651] bg-[#0d0b14] px-3 py-2 text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]" htmlFor={`target-${course.localId}`}>
                Target score (%)
              </label>
              <input
                id={`target-${course.localId}`}
                type="number"
                min="0"
                max="100"
                value={course.targetScore}
                onChange={(e) => onUpdate(course.localId, { targetScore: e.target.value })}
                className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
              />
              {fieldErrors[`${course.localId}-targetScore`] && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors[`${course.localId}-targetScore`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]" htmlFor={`color-${course.localId}`}>
                Theme color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`color-${course.localId}`}
                  type="color"
                  value={course.themeColor}
                  onChange={(e) => onUpdate(course.localId, { themeColor: e.target.value })}
                  className="h-9 w-10 rounded border border-[#3d3651] bg-transparent cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={course.themeColor}
                  onChange={(e) => onUpdate(course.localId, { themeColor: e.target.value })}
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
                  value={course.continuousAssessment}
                  onChange={(e) => onUpdate(course.localId, { continuousAssessment: e.target.value })}
                  aria-label="Continuous assessment percentage"
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
                  value={course.exam}
                  onChange={(e) => onUpdate(course.localId, { exam: e.target.value })}
                  aria-label="Exam percentage"
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
              <button
                type="button"
                onClick={() => onAddAssessment(course.localId)}
                className="flex items-center gap-1 text-xs text-[#6d28d9] hover:opacity-70"
              >
                <PlusIcon size={16} /> Add assessment
              </button>
            </div>

            {course.assessments.length === 0 && (
              <p className="text-xs text-[#6b6580]">No assessments yet — add quizzes, CAs, or exams to track.</p>
            )}

            {course.assessments.map((assessment) => (
              <div key={assessment.localId} className="p-3 rounded-md border border-[#3d3651] flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={assessment.title}
                      onChange={(e) => onUpdateAssessment(course.localId, assessment.localId, { title: e.target.value })}
                      placeholder="Assessment title"
                      className="rounded-md border border-[#3d3651] bg-transparent px-2 py-1.5 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
                    />
                    <input
                      type="date"
                      value={assessment.dueDate}
                      onChange={(e) => onUpdateAssessment(course.localId, assessment.localId, { dueDate: e.target.value })}
                      className="rounded-md border border-[#3d3651] bg-transparent px-2 py-1.5 text-sm text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveAssessment(course.localId, assessment.localId)}
                    className="text-[#b0b0b0] hover:text-red-400 mt-1.5 shrink-0"
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
                    className="rounded-md border border-[#3d3651] bg-transparent px-2 py-1.5 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={assessment.scoreAchieved}
                    onChange={(e) => onUpdateAssessment(course.localId, assessment.localId, { scoreAchieved: e.target.value })}
                    placeholder="Score (optional)"
                    className="rounded-md border border-[#3d3651] bg-transparent px-2 py-1.5 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
                  />
                  <label className="flex items-center gap-2 text-xs text-[#b0b0b0] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={assessment.isCompleted}
                      onChange={(e) => onUpdateAssessment(course.localId, assessment.localId, { isCompleted: e.target.checked })}
                      className="accent-[#6d28d9]"
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

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#f5f5f5]">Study links</p>
              <button
                type="button"
                onClick={() => onAddStudyLink(course.localId)}
                className="flex items-center gap-1 text-xs text-[#6d28d9] hover:opacity-70"
              >
                <PlusIcon size={16} /> Add link
              </button>
            </div>

            {course.studyLinks.length === 0 && (
              <p className="text-xs text-[#6b6580]">No links yet — drop in lecture notes, slides, or past papers.</p>
            )}

            {course.studyLinks.map((link) => (
              <div key={link.localId} className="flex items-start gap-2">
                <LinkIcon size={18} className="text-[#b0b0b0] mt-2 shrink-0" />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => onUpdateStudyLink(course.localId, link.localId, { title: e.target.value })}
                    placeholder="Link title"
                    className="rounded-md border border-[#3d3651] bg-transparent px-2 py-1.5 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => onUpdateStudyLink(course.localId, link.localId, { url: e.target.value })}
                    placeholder="https://..."
                    className="rounded-md border border-[#3d3651] bg-transparent px-2 py-1.5 text-sm text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveStudyLink(course.localId, link.localId)}
                  className="text-[#b0b0b0] hover:text-red-400 mt-1.5 shrink-0"
                  aria-label="Remove study link"
                >
                  <XIcon size={16} />
                </button>
              </div>
            ))}

            {fieldErrors[`${course.localId}-links`] && (
              <p className="text-xs text-red-400">{fieldErrors[`${course.localId}-links`]}</p>
            )}
          </div>

          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(course.localId)}
              className="self-start flex items-center gap-1 text-xs text-red-400 hover:opacity-70 mt-1"
            >
              <TrashIcon size={16} /> Remove course
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const Create = () => {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [courses, setCourses] = useState<CourseFormState[]>([createEmptyCourse()])

  const [checkingStatus, setCheckingStatus] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const { semesterId } = useParams<{ semesterId: string }>()
    const location = useLocation()
    const isEditMode = Boolean(semesterId)
    const passedSemester = (location.state as { semester?: SemesterDoc } | undefined)?.semester


    const toInputDate = (value: string) => value.slice(0, 10)

    const populateFromSemester = (semester: SemesterDoc) => {
    setTitle(semester.title)
    setStartDate(toInputDate(semester.startDate))
    setEndDate(toInputDate(semester.endDate))
    setCourses(
        semester.courses.map((course) => ({
        localId: generateId(),
        name: course.name,
        creditLoad: String(course.creditLoad),
        difficulty: course.difficulty,
        themeColor: course.themeColor,
        targetScore: String(course.targetScore),
        continuousAssessment: String(course.gradingScheme.continuousAssessment),
        exam: String(course.gradingScheme.exam),
        assessments: course.assessments.map((a) => ({
            localId: generateId(),
            title: a.title,
            dueDate: toInputDate(a.dueDate),
            weight: String(a.weight),
            scoreAchieved: a.scoreAchieved != null ? String(a.scoreAchieved) : '',
            isCompleted: a.isCompleted,
        })),
        studyLinks: course.studyLinks.map((link) => ({
            localId: generateId(),
            title: link.title,
            url: link.url,
        })),
        isExpanded: false,
        })),
    )
    }

    useEffect(() => {
  let isMounted = true

  const init = async () => {
    if (isEditMode) {
      if (passedSemester) {
        populateFromSemester(passedSemester)
        if (isMounted) setCheckingStatus(false)
        return
      }
      try {
        const all = await semesterApi.getAll()
        const existing = all.find((s) => s._id === semesterId)
        if (existing) {
          populateFromSemester(existing)
        } else {
          navigate('/home')
        }
      } catch (err) {
        console.error('Could not load semester to edit:', err)
        navigate('/home')
      } finally {
        if (isMounted) setCheckingStatus(false)
      }
      return
    }

    const auth = getAuth()
    const currentUser = auth.currentUser
    if (!currentUser) {
      if (isMounted) setCheckingStatus(false)
      return
    }
    try {
      const status = await semesterApi.checkStatus(currentUser.uid)
      if (status.hasSemester) {
        navigate('/home')
        return
      }
    } catch (err) {
      console.error('Could not verify existing semester status:', err)
    } finally {
      if (isMounted) setCheckingStatus(false)
    }
  }

  init()
  return () => {
    isMounted = false
  }
}, [isEditMode, semesterId, navigate])


  const addCourse = () => {
    setCourses((prev) => [...prev, createEmptyCourse()])
  }

  const removeCourse = (localId: string) => {
    setCourses((prev) => prev.filter((course) => course.localId !== localId))
  }

  const updateCourse = (localId: string, patch: Partial<CourseFormState>) => {
    setCourses((prev) => prev.map((course) => (course.localId === localId ? { ...course, ...patch } : course)))
  }

  const toggleCourseExpanded = (localId: string) => {
    setCourses((prev) =>
      prev.map((course) => (course.localId === localId ? { ...course, isExpanded: !course.isExpanded } : course)),
    )
  }

  const addAssessment = (courseId: string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.localId === courseId ? { ...course, assessments: [...course.assessments, createEmptyAssessment()] } : course,
      ),
    )
  }

  const updateAssessment = (courseId: string, assessmentId: string, patch: Partial<AssessmentFormState>) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.localId === courseId
          ? {
              ...course,
              assessments: course.assessments.map((assessment) =>
                assessment.localId === assessmentId ? { ...assessment, ...patch } : assessment,
              ),
            }
          : course,
      ),
    )
  }

  const removeAssessment = (courseId: string, assessmentId: string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.localId === courseId
          ? { ...course, assessments: course.assessments.filter((assessment) => assessment.localId !== assessmentId) }
          : course,
      ),
    )
  }

  const addStudyLink = (courseId: string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.localId === courseId ? { ...course, studyLinks: [...course.studyLinks, createEmptyStudyLink()] } : course,
      ),
    )
  }

  const updateStudyLink = (courseId: string, linkId: string, patch: Partial<StudyLinkFormState>) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.localId === courseId
          ? {
              ...course,
              studyLinks: course.studyLinks.map((link) => (link.localId === linkId ? { ...link, ...patch } : link)),
            }
          : course,
      ),
    )
  }

  const removeStudyLink = (courseId: string, linkId: string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.localId === courseId
          ? { ...course, studyLinks: course.studyLinks.filter((link) => link.localId !== linkId) }
          : course,
      ),
    )
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!title.trim()) errors.title = 'Give this semester a name.'
    if (!startDate) errors.startDate = 'Pick a start date.'
    if (!endDate) errors.endDate = 'Pick an end date.'
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      errors.endDate = 'End date must be after the start date.'
    }

    if (courses.length === 0) {
      errors.courses = 'Add at least one course.'
    }

    courses.forEach((course) => {
      if (!course.name.trim()) errors[`${course.localId}-name`] = 'Course name is required.'

      const credit = Number(course.creditLoad)
      if (!course.creditLoad || Number.isNaN(credit) || credit <= 0) {
        errors[`${course.localId}-creditLoad`] = 'Enter a valid credit load.'
      }

      const target = Number(course.targetScore)
      if (course.targetScore && (Number.isNaN(target) || target < 0 || target > 100)) {
        errors[`${course.localId}-targetScore`] = 'Target score must be between 0 and 100.'
      }

      const ca = Number(course.continuousAssessment)
      const exam = Number(course.exam)
      if (Number.isNaN(ca) || Number.isNaN(exam) || ca + exam !== 100) {
        errors[`${course.localId}-grading`] = 'Continuous assessment and exam weight must add up to 100.'
      }

      course.assessments.forEach((assessment) => {
        if (!assessment.title.trim()) errors[`${assessment.localId}-title`] = 'Assessment needs a title.'
        if (!assessment.dueDate) errors[`${assessment.localId}-dueDate`] = 'Pick a due date.'
        const weight = Number(assessment.weight)
        if (!assessment.weight || Number.isNaN(weight) || weight <= 0) {
          errors[`${assessment.localId}-weight`] = 'Enter a valid weight.'
        }
      })

      course.studyLinks.forEach((link) => {
        if (!link.title.trim() || !link.url.trim()) {
          errors[`${course.localId}-links`] = 'Every study link needs a title and a URL.'
        }
      })
    })

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const buildPayload = (): CreateSemesterPayload => ({
    title: title.trim(),
    startDate,
    endDate,
    courses: courses.map((course) => ({
      name: course.name.trim(),
      creditLoad: Number(course.creditLoad),
      difficulty: course.difficulty,
      themeColor: course.themeColor,
      targetScore: Number(course.targetScore),
      gradingScheme: {
        continuousAssessment: Number(course.continuousAssessment),
        exam: Number(course.exam),
      },
      assessments: course.assessments.map((assessment) => ({
        title: assessment.title.trim(),
        dueDate: assessment.dueDate,
        weight: Number(assessment.weight),
        isCompleted: assessment.isCompleted,
        ...(assessment.scoreAchieved.trim() !== '' ? { scoreAchieved: Number(assessment.scoreAchieved) } : {}),
      })),
      studyLinks: course.studyLinks.map((link) => ({ title: link.title.trim(), url: link.url.trim() })),
    })),
  })

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!validate()) {
      setError('Fix the highlighted fields before continuing.')
      return
    }

    setIsSaving(true)

    try {
    if (isEditMode && semesterId) {
        await semesterApi.update(semesterId, buildPayload())
    } else {
        await semesterApi.create(buildPayload())
    }
    navigate('/home')
    } catch (err: any) {
    console.error('Error saving semester:', err)
    setError(err.message || 'We had trouble saving your semester. Please try again.')
    } finally {
    setIsSaving(false)
    }
  }

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0b14]">
        <Spinner size={32} />
      </div>
    )
  }

  return (
    
    <div className="min-h-screen py-12 px-6 sm:px-10">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-8">
        <button
        type="button"
        onClick={() => navigate(-1)}
        className="self-start flex items-center gap-1 text-sm hover:opacity-70 cursor-pointer mb-2"
        >
        <ArrowLeftIcon size={22} />
        </button>
        <div className="text-center mb-2">
          <h1 className="text-3xl font-semibold text-[#f5f5f5] mb-3">
            {isEditMode ? 'Edit your semester' : 'Set up your semester'}
            </h1>
            <p className="text-[#b0b0b0]">
            {isEditMode
                ? 'Update your courses, grading breakdown, and assessments.'
                : 'Add your courses, grading breakdown, and assessments so Stride can keep you on track.'}
            </p>
        </div>

        <div className="p-6 rounded-lg border border-[#3d3651] flex flex-col gap-4">
          <h2 className="text-lg font-medium text-[#f5f5f5]">Semester details</h2>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]" htmlFor="semester-title">
              Semester name
            </label>
            <input
              id="semester-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Fall 2026"
              className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-[#f5f5f5] placeholder:text-[#6b6580] focus:border-[#6d28d9] outline-none"
              disabled={isSaving}
            />
            {fieldErrors.title && <p className="text-xs text-red-400 mt-1">{fieldErrors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]" htmlFor="semester-start">
                Start date
              </label>
              <input
                id="semester-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
                disabled={isSaving}
              />
              {fieldErrors.startDate && <p className="text-xs text-red-400 mt-1">{fieldErrors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#f5f5f5]" htmlFor="semester-end">
                End date
              </label>
              <input
                id="semester-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-md border border-[#3d3651] bg-transparent px-3 py-2 text-[#f5f5f5] focus:border-[#6d28d9] outline-none"
                disabled={isSaving}
              />
              {fieldErrors.endDate && <p className="text-xs text-red-400 mt-1">{fieldErrors.endDate}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[#f5f5f5]">Courses</h2>
            <button
              type="button"
              onClick={addCourse}
              disabled={isSaving}
              className="flex items-center gap-1 text-sm text-[#6d28d9] hover:opacity-70 disabled:opacity-40"
            >
              <PlusIcon size={18} /> Add course
            </button>
          </div>

          {fieldErrors.courses && <p className="text-xs text-red-400">{fieldErrors.courses}</p>}

          {courses.map((course, index) => (
            <CourseCard
              key={course.localId}
              course={course}
              index={index}
              canRemove={courses.length > 1}
              fieldErrors={fieldErrors}
              onUpdate={updateCourse}
              onRemove={removeCourse}
              onToggleExpand={toggleCourseExpanded}
              onAddAssessment={addAssessment}
              onUpdateAssessment={updateAssessment}
              onRemoveAssessment={removeAssessment}
              onAddStudyLink={addStudyLink}
              onUpdateStudyLink={updateStudyLink}
              onRemoveStudyLink={removeStudyLink}
            />
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 rounded-lg font-medium transition-all flex justify-center items-center bg-[#6d28d9] text-white hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed"
        >
         {isSaving ? <Spinner /> : isEditMode ? 'Save changes' : 'Create semester'}
        </button>
      </form>
    </div>
  )
}

export default Create