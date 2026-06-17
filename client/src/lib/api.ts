import { getAuth } from 'firebase/auth'

const BASE_URL = 'http://localhost:3000/api'

export interface UserProfile {
  name: string
  institution: string
}

export interface UserDoc {
  _id: string
  email: string
  profile: UserProfile
  createdAt?: string
  updatedAt?: string
}

export interface CreateUserPayload {
  email: string
  profile: UserProfile
}

export interface Assessment {
  _id?: string
  title: string
  dueDate: string
  weight: number
  scoreAchieved?: number
  isCompleted: boolean
}

export interface StudyLink {
  _id?: string
  title: string
  url: string
}

export interface Course {
  _id?: string
  name: string
  creditLoad: number
  difficulty: 'low' | 'medium' | 'high'
  themeColor: string
  targetScore: number
  gradingScheme: {
    continuousAssessment: number
    exam: number
  }
  postExamReflection?: string
  assessments: Assessment[]
  studyLinks: StudyLink[]
}

export interface SemesterDoc {
  _id: string
  userId: string
  title: string
  startDate: string
  endDate: string
  courses: Course[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateSemesterPayload {
  title: string
  startDate: string
  endDate: string
  courses?: Course[]
}

export interface UpdateSemesterPayload {
  title?: string
  startDate?: string
  endDate?: string
  courses?: Course[]
}

export interface SemesterCheckResponse {
  hasSemester: boolean
  semester: {
    _id: string
    title: string
    startDate: string
    endDate: string
    courseCount: number
  } | null
}

export type TopicStatus = 'backlog' | 'scheduled' | 'mastered'

export interface Topic {
  _id: string
  userId: string
  semesterId: string
  courseId: string
  title: string
  isCompleted: boolean
  completedAt?: string
  status: TopicStatus
  resourceLink: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateTopicPayload {
  semesterId: string
  courseId: string
  title: string
  status?: TopicStatus
  resourceLink?: string
}

export interface UpdateTopicPayload {
  title?: string
  isCompleted?: boolean
  status?: TopicStatus
  resourceLink?: string
}

export interface Note {
  _id: string
  userId: string
  semesterId: string
  content: string
  color: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateNotePayload {
  semesterId: string
  content: string
  color?: string
}

export interface GeneralStudyLink {
  _id: string
  userId: string
  semesterId: string
  title: string
  url: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateGeneralStudyLinkPayload {
  semesterId: string
  title: string
  url: string
}

export type MoodState = 'overwhelmed' | 'neutral' | 'great'

export interface MoodLog {
  _id?: string
  dateString: string
  mood: MoodState
  timestamp?: string
}

export interface MoodTrackerDoc {
  _id: string
  userId: string
  logs: MoodLog[]
  createdAt?: string
  updatedAt?: string
}

export interface MoodStatusResponse {
  hasLoggedToday: boolean
  mood: MoodState | null
}

export interface LogMoodPayload {
  mood: MoodState
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const auth = getAuth()
  const currentUser = auth.currentUser

  if (!currentUser) {
    throw new Error('Authentication required before making API requests.')
  }

  const token = await currentUser.getIdToken()

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.message || `API Error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export const userApi = {
  create: (payload: CreateUserPayload) => {
    return apiFetch<UserDoc>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  get: () => {
    return apiFetch<UserDoc>('/users')
  },
}

export const semesterApi = {
  create: (payload: CreateSemesterPayload) => {
    return apiFetch<SemesterDoc>('/semesters', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  getAll: () => {
    return apiFetch<SemesterDoc[]>('/semesters')
  },
  update: (id: string, payload: UpdateSemesterPayload) => {
    return apiFetch<SemesterDoc>(`/semesters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  checkStatus: (userId: string) => {
    return apiFetch<SemesterCheckResponse>(`/semesters/${userId}/check`)
  },
}

export type UpdateCoursePayload = Omit<Course, '_id'>

export const courseApi = {
  update: (userId: string, courseId: string, payload: UpdateCoursePayload) => {
    return apiFetch<SemesterDoc>(`/semesters/${userId}/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}

export const topicApi = {
  getByCourse: (courseId: string) => {
    return apiFetch<Topic[]>(`/topics/course/${encodeURIComponent(courseId)}`)
  },
  create: (payload: CreateTopicPayload) => {
    return apiFetch<Topic>('/topics', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update: (id: string, payload: UpdateTopicPayload) => {
    return apiFetch<Topic>(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  remove: (id: string) => {
    return apiFetch<{ message?: string }>(`/topics/${id}`, {
      method: 'DELETE',
    })
  },
}

export const noteApi = {
  getBySemester: (semesterId: string) => {
    return apiFetch<Note[]>(`/notes/semester/${encodeURIComponent(semesterId)}`)
  },
  create: (payload: CreateNotePayload) => {
    return apiFetch<Note>('/notes/save', { 
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  remove: (id: string) => {
    return apiFetch<{ message?: string }>(`/notes/${id}`, {
      method: 'DELETE',
    })
  },
}

export const generalStudyLinkApi = {
  getBySemester: (semesterId: string) => {
    return apiFetch<GeneralStudyLink[]>(`/general-study-links/semester/${encodeURIComponent(semesterId)}`)
  },
  create: (payload: CreateGeneralStudyLinkPayload) => {
    return apiFetch<GeneralStudyLink>('/general-study-links', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  remove: (id: string) => {
    return apiFetch<{ message?: string }>(`/general-study-links/${id}`, {
      method: 'DELETE',
    })
  },
}

export const moodApi = {
  // Checks if the user already logged a mood today (returns { hasLoggedToday: boolean, mood: string | null })
  checkTodayStatus: () => {
    return apiFetch<MoodStatusResponse>('/moods/today')
  },

  // Logs or updates today's mood
  logMood: (payload: LogMoodPayload) => {
    return apiFetch<MoodTrackerDoc>('/moods', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}