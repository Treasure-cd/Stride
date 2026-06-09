export type LearningProfile = 
  | 'Focus & Attention'
  | 'Reading & Writing'
  | 'Energy & Pacing'
  | 'Anxiety & Overwhelm'
  | 'Standard Track'

export interface GradingComponent {
  id: string
  name: string
  weight: number
}

export interface Course {
  id: string
  name: string
  targetGrade: string
  gradingComponents: GradingComponent[]
}

export interface OnboardingData {
  displayName: string
  learningProfiles: LearningProfile[]
  courses: Course[]
  reflectionNote: string
}

export interface UserProfile {
  uid: string
  displayName: string
  learningProfiles: LearningProfile[]
  createdAt: Date
}

export interface SavedCourse {
  id: string
  name: string
  targetGrade: string
  gradingComponents: GradingComponent[]
  createdAt: Date
}

export interface SavedNote {
  id: string
  text: string
  createdAt: Date
}
