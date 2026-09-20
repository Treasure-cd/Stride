import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PencilSimpleIcon } from '../lib/icons'
import {
  semesterApi,
  topicApi,
  noteApi,
  generalStudyLinkApi,
  moodApi,
  assessmentApi,
} from '../lib/api'
import type {
  SemesterDoc,
  Course,
  Topic,
  TopicStatus,
  Note,
  GeneralStudyLink,
  MoodState,
} from '../lib/api'
import { celebrate } from '../lib/celebrate'
import { useAuth } from '../context/AuthContext'
import CourseEditModal from '../components/layout/CourseEditModal'
import Navbar from '../components/layout/Navbar'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Spinner from '../components/ui/Spinner'
import { formatDate, formatShortDate, formatTime } from '../utils/formatDateTime'
import MetaCard from '../components/home/MetaCard'
import CourseTab from '../components/home/CourseTab'
import NotesTab from '../components/home/NotesTab'
import HomePanel from '../components/home/HomePanel'
import { invalidateRecommendationsCache } from '../components/layout/RecommendationsPanel'
import CoursePanel from '../components/home/CoursePanel'

// Cache variables, they're here to survive react state
let cachedSemester: SemesterDoc | null = null;
let hasLoadedSemester = false;
let cachedNotes: Note[] | null = null;
let cachedLinks: GeneralStudyLink[] | null = null;
let cachedTopics: Record<string, Topic[]> = {};

const Home = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  // Initialize state with cached data if it exists
  const [semester, setSemester] = useState<SemesterDoc | null>(cachedSemester)
  const [loadingSemester, setLoadingSemester] = useState(!hasLoadedSemester)
  const [semesterError, setSemesterError] = useState<string | null>(null)

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const [topicsByCourse, setTopicsByCourse] = useState<Record<string, Topic[]>>(cachedTopics)
  const [topicsLoading, setTopicsLoading] = useState(false)

  const [notes, setNotes] = useState<Note[]>(cachedNotes || [])
  const [notesLoading, setNotesLoading] = useState(!cachedNotes)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteColor, setNewNoteColor] = useState('#6d28d9')
  const [savingNote, setSavingNote] = useState(false)

  const [links, setLinks] = useState<GeneralStudyLink[]>(cachedLinks || [])
  const [linksLoading, setLinksLoading] = useState(!cachedLinks)
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

  // Helper to update both state and cache simultaneously
  const updateSemesterState = (newSemester: SemesterDoc | null) => {
    cachedSemester = newSemester
    setSemester(newSemester)
  }

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return
      setMoodLoading(true)
      moodApi
        .checkTodayStatus()
        .then((res) => setTodayMood(res.mood))
        .catch(console.error)
        .finally(() => setMoodLoading(false))
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/auth')
      return
    }
    const loadSemester = async () => {
      // Only show full loading screen if we don't have a cached version
      if (!hasLoadedSemester) {
        setLoadingSemester(true)
      }
      setSemesterError(null)
      try {
        const semesters = await semesterApi.getAll()
        if (semesters.length === 0) {
          hasLoadedSemester = true
          updateSemesterState(null)
          return
        }
        const today = new Date()
        const active = semesters.find((s) => new Date(s.startDate) <= today && today <= new Date(s.endDate))
        const current = active || semesters[0]
        
        hasLoadedSemester = true
        updateSemesterState(current)
      } catch (err: any) {
        console.error('Failed to load semester:', err)
        if (!cachedSemester) {
          setSemesterError(err.message || 'Could not load your semester.')
        }
      } finally {
        setLoadingSemester(false)
      }
    }
    loadSemester()
  }, [navigate, authLoading, user])

  useEffect(() => {
    if (!semester) return

    // Only show loading if we don't have cached data yet
    if (!cachedNotes) setNotesLoading(true)
    if (!cachedLinks) setLinksLoading(true)

    // Fetch silently in the background
    noteApi
      .getBySemester(semester._id)
      .then((notesData) => {
        cachedNotes = notesData
        setNotes(notesData)
      })
      .catch((err) => console.error('Failed to load notes:', err))
      .finally(() => setNotesLoading(false))

    generalStudyLinkApi
      .getBySemester(semester._id)
      .then((linksData) => {
        cachedLinks = linksData
        setLinks(linksData)
      })
      .catch((err) => console.error('Failed to load links:', err))
      .finally(() => setLinksLoading(false))
  }, [semester])

  useEffect(() => {
    if (!selectedCourseId) return
    
    // We already have it, don't show loading (but still fetch updates in background)
    if (!cachedTopics[selectedCourseId]) {
      setTopicsLoading(true)
    }

    const loadTopics = async () => {
      try {
        const data = await topicApi.getByCourse(selectedCourseId)
        cachedTopics[selectedCourseId] = data
        setTopicsByCourse((prev) => ({ ...prev, [selectedCourseId]: data }))
      } catch (err) {
        console.error('Failed to load topics:', err)
      } finally {
        setTopicsLoading(false)
      }
    }
    loadTopics()
  }, [selectedCourseId])

  const handleLogMood = async (mood: MoodState) => {
    try {
      await moodApi.logMood({ mood })
      setTodayMood(mood)
      invalidateRecommendationsCache()
    } catch (err) {
      console.error('Could not save mood:', err)
    }
  }

  const handleSelectCourse = (courseId: string | null) => {
    setSelectedCourseId(courseId)
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
      const updatedNotes = [note, ...notes]
      cachedNotes = updatedNotes
      setNotes(updatedNotes)
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
      const updatedNotes = notes.filter((note) => note._id !== id)
      cachedNotes = updatedNotes
      setNotes(updatedNotes)
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
      const updatedLinks = [link, ...links]
      cachedLinks = updatedLinks
      setLinks(updatedLinks)
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
      const updatedLinks = links.filter((link) => link._id !== id)
      cachedLinks = updatedLinks
      setLinks(updatedLinks)
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
      
      const currentTopics = topicsByCourse[selectedCourseId] || []
      const newTopics = [...currentTopics, topic]
      
      cachedTopics[selectedCourseId] = newTopics
      setTopicsByCourse((prev) => ({
        ...prev,
        [selectedCourseId]: newTopics,
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
      
      const newTopics = topicsByCourse[selectedCourseId].map((t) => (t._id === topic._id ? updated : t))
      cachedTopics[selectedCourseId] = newTopics
      
      setTopicsByCourse((prev) => ({
        ...prev,
        [selectedCourseId]: newTopics,
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
      
      const newTopics = topicsByCourse[selectedCourseId].map((t) => (t._id === topic._id ? updated : t))
      cachedTopics[selectedCourseId] = newTopics
      
      setTopicsByCourse((prev) => ({
        ...prev,
        [selectedCourseId]: newTopics,
      }))
    } catch (err) {
      console.error('Failed to update topic status:', err)
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    if (!selectedCourseId) return
    try {
      await topicApi.remove(topicId)
      
      const newTopics = topicsByCourse[selectedCourseId].filter((t) => t._id !== topicId)
      cachedTopics[selectedCourseId] = newTopics
      
      setTopicsByCourse((prev) => ({
        ...prev,
        [selectedCourseId]: newTopics,
      }))
    } catch (err) {
      console.error('Failed to delete topic:', err)
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
      updateSemesterState(updatedSemester) // Saves to cache too
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

  if (loadingSemester) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

if (semesterError) {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center border border-red-900/40 bg-red-950/20 rounded-xl p-8 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-lg">
            !
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-[#f5f5f5]">Failed to load semester</h2>
            <p className="text-sm text-[#b0b0b0]">{semesterError}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-5 py-2.5 rounded-lg bg-[#3d3651] text-[#f5f5f5] text-sm font-medium hover:bg-[#4d4466] transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    </>
  )
}

if (!semester) {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center border border-[#3d3651]/60 bg-[#171717] rounded-2xl p-8 sm:p-10 flex flex-col items-center shadow-xl">
          <h2 className="text-2xl font-bold text-[#f5f5f5] mb-2">
            No active semester
          </h2>
          <p className="text-sm text-[#b0b0b0] leading-relaxed mb-6">
            Get started by organizing your courses, topics, and study links all in one dashboard.
          </p>

          <button
            onClick={() => navigate('/create')}
            className="w-full py-3 px-5 rounded-lg bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            Create Your First Semester
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
            <div className="group flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-(--text-h) tracking-tight">
                {semester.title}
              </h1>
              <button
                type="button"
                onClick={() => navigate(`/edit/${semester._id}`, { state: { semester } })}
                className="p-1 rounded-md text-(--text) opacity-60 hover:opacity-100 hover:text-(--accent) sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer"
                aria-label="Edit semester"
              >
                <PencilSimpleIcon size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <MetaCard label="Start" value={formatDate(semester.startDate)} rotate="0" />
              <MetaCard label="End" value={formatDate(semester.endDate)} rotate="0" />
              <MetaCard label="Today" value={`${formatShortDate(now)} · ${formatTime(now)}`} rotate="0" />
            </div>
          </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-40 shrink-0 flex flex-col gap-3">
            <div className="flex lg:flex-col gap-3.5 overflow-x-auto lg:overflow-visible pb-2 no-scrollbar">
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
                onSaved={updateSemesterState}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home