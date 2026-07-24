export type Difficulty = 'low' | 'medium' | 'high'

export interface AssessmentFormState {
  localId: string
  title: string
  dueDate: string
  weight: string
  scoreAchieved: string
  isCompleted: boolean
}

export interface StudyLinkFormState {
  localId: string
  title: string
  url: string
}

export interface CourseFormState {
  localId: string
  name: string
  creditLoad: string
  difficulty: Difficulty
  themeColor: string
  targetScore: string
  continuousAssessment: string
  exam: string
  assessments: AssessmentFormState[]
  studyLinks: StudyLinkFormState[]
  isExpanded: boolean
}
