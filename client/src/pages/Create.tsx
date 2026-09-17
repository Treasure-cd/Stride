import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { getAuth } from 'firebase/auth'
import { PlusIcon, ArrowLeftIcon } from '../lib/icons'
import { semesterApi } from '../lib/api'
import type { CreateSemesterPayload, SemesterDoc } from '../lib/api'
import type { AssessmentFormState, StudyLinkFormState, CourseFormState } from '../types/semester'
import Spinner from '../components/ui/Spinner'
import CourseCard from '../components/create/CourseCard'

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

  const addCourse = () => setCourses((prev) => [...prev, createEmptyCourse()])
  const removeCourse = (localId: string) => setCourses((prev) => prev.filter((c) => c.localId !== localId))
  const updateCourse = (localId: string, patch: Partial<CourseFormState>) =>
    setCourses((prev) => prev.map((c) => (c.localId === localId ? { ...c, ...patch } : c)))
  const toggleCourseExpanded = (localId: string) =>
    setCourses((prev) => prev.map((c) => (c.localId === localId ? { ...c, isExpanded: !c.isExpanded } : c)))

  const addAssessment = (courseId: string) =>
    setCourses((prev) =>
      prev.map((c) => (c.localId === courseId ? { ...c, assessments: [...c.assessments, createEmptyAssessment()] } : c)),
    )
  const updateAssessment = (courseId: string, assessmentId: string, patch: Partial<AssessmentFormState>) =>
    setCourses((prev) =>
      prev.map((c) =>
        c.localId === courseId
          ? { ...c, assessments: c.assessments.map((a) => (a.localId === assessmentId ? { ...a, ...patch } : a)) }
          : c,
      ),
    )
  const removeAssessment = (courseId: string, assessmentId: string) =>
    setCourses((prev) =>
      prev.map((c) =>
        c.localId === courseId ? { ...c, assessments: c.assessments.filter((a) => a.localId !== assessmentId) } : c,
      ),
    )

  const addStudyLink = (courseId: string) =>
    setCourses((prev) =>
      prev.map((c) => (c.localId === courseId ? { ...c, studyLinks: [...c.studyLinks, createEmptyStudyLink()] } : c)),
    )
  const updateStudyLink = (courseId: string, linkId: string, patch: Partial<StudyLinkFormState>) =>
    setCourses((prev) =>
      prev.map((c) =>
        c.localId === courseId
          ? { ...c, studyLinks: c.studyLinks.map((l) => (l.localId === linkId ? { ...l, ...patch } : l)) }
          : c,
      ),
    )
  const removeStudyLink = (courseId: string, linkId: string) =>
    setCourses((prev) =>
      prev.map((c) =>
        c.localId === courseId ? { ...c, studyLinks: c.studyLinks.filter((l) => l.localId !== linkId) } : c,
      ),
    )

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!title.trim()) errors.title = 'Give this semester a name.'
    if (!startDate) errors.startDate = 'Pick a start date.'
    if (!endDate) errors.endDate = 'Pick an end date.'
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      errors.endDate = 'End date must be after the start date.'
    }
    if (courses.length === 0) errors.courses = 'Add at least one course.'

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
      <div className="min-h-screen flex items-center justify-center bg-(--bg)">
        <Spinner size={32} className="text-(--accent)" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-6 sm:px-10 bg-(--bg) text-(--text)">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="self-start flex items-center gap-1 text-sm text-(--text) hover:text-(--text-h) transition-opacity hover:opacity-75 cursor-pointer mb-2"
        >
          <ArrowLeftIcon size={20} />
          <span>Back</span>
        </button>

        <div className="text-center mb-2">
          <h1 className="text-3xl font-semibold text-(--text-h) mb-3">
            {isEditMode ? 'Edit your semester' : 'Set up your semester'}
          </h1>
          <p className="text-sm text-(--text) opacity-70 max-w-md mx-auto">
            {isEditMode
              ? 'Update your courses, grading breakdown, and assessments.'
              : 'Add your courses, grading breakdown, and assessments so Stride can keep you on track.'}
          </p>
        </div>

        {/* Elevated Card Section */}
        <div className="p-6 sm:p-8 rounded-xl bg-(--bg-elevated) border border-(--border-subtle) flex flex-col gap-5">
          <h2 className="text-lg font-medium text-(--text-h)">Semester details</h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-(--text) opacity-80" htmlFor="semester-title">
              Semester name
            </label>
            <input
              id="semester-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Fall 2026"
              className="w-full rounded-lg bg-(--bg) border border-(--input-border) px-3.5 py-2.5 text-(--text-h) placeholder:text-(--text) placeholder:opacity-40 focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none"
              disabled={isSaving}
            />
            {fieldErrors.title && <p className="text-xs text-red-400 mt-1.5">{fieldErrors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-(--text) opacity-80" htmlFor="semester-start">
                Start date
              </label>
              <input
                id="semester-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg bg-(--bg) border border-(--input-border) px-3.5 py-2.5 text-(--text-h) focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none [color-scheme:dark]"
                disabled={isSaving}
              />
              {fieldErrors.startDate && <p className="text-xs text-red-400 mt-1.5">{fieldErrors.startDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-(--text) opacity-80" htmlFor="semester-end">
                End date
              </label>
              <input
                id="semester-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-lg bg-(--bg) border border-(--input-border) px-3.5 py-2.5 text-(--text-h) focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all outline-none [color-scheme:dark]"
                disabled={isSaving}
              />
              {fieldErrors.endDate && <p className="text-xs text-red-400 mt-1.5">{fieldErrors.endDate}</p>}
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-(--text-h)">Courses</h2>
            <button
              type="button"
              onClick={addCourse}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--accent) hover:opacity-75 disabled:opacity-40 transition-opacity cursor-pointer"
            >
              <PlusIcon size={18} /> Add course
            </button>
          </div>

          {fieldErrors.courses && <p className="text-xs text-red-400">{fieldErrors.courses}</p>}

          <div className="flex flex-col gap-4">
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
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 rounded-lg font-medium transition-all flex justify-center items-center bg-(--accent) text-white hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
        >
          {isSaving ? <Spinner className="text-white" /> : isEditMode ? 'Save changes' : 'Create semester'}
        </button>
      </form>
    </div>
  )
}

export default Create