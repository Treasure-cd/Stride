import MoodTracker from "../models/MoodTracker.js";
import Preferences from "../models/Preferences.js";
import Topic from "../models/StudyTask.js";
import Semester from "../models/Semester.js";

const getTodayString = () => new Date().toISOString().split('T')[0];

const LOAD_MAP = { overwhelmed: 1, neutral: 2, great: 3 };

const DISABILITY = {
  ADHD: 'Focus & Attention',
  READING_WRITING: 'Reading & Writing',
  ENERGY_PACING: 'Energy & Pacing',
  ANXIETY: 'Anxiety & Overwhelm',
};

const MESSAGES = {
  overwhelmed: {
    default: "You're feeling overwhelmed today — let's keep it light.",
    [DISABILITY.ANXIETY]: "Take it easy today. One small step is enough.",
    [DISABILITY.ENERGY_PACING]: "Low energy is valid. Here's something gentle.",
  },
  neutral: {
    default: "Steady day — here's a balanced plan for you.",
    [DISABILITY.ADHD]: "Let's keep things moving with a focused session.",
  },
  great: {
    default: "You're in a great headspace — let's make the most of it.",
    [DISABILITY.ADHD]: "High energy! Let's get some solid work done.",
    [DISABILITY.ANXIETY]: "Feeling good today — here's a manageable plan.",
  },
};

function pickMessage(mood, disabilities) {
  const moodMessages = MESSAGES[mood];
  for (const disability of disabilities) {
    if (moodMessages[disability]) return moodMessages[disability];
  }
  return moodMessages.default;
}

function daysUntil(dateString) {
  const due = new Date(dateString);
  const now = new Date();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

export const getRecommendations = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting getRecommendations execution...");
  try {
    const uid = req.user.uid;

    // 1. Resolve today's mood, fall back to neutral
    const todayStr = getTodayString();
    const moodTracker = await MoodTracker.findOne({ userId: uid });
    let mood = 'neutral';
    if (moodTracker) {
      const todayLog = moodTracker.logs.find((log) => log.dateString === todayStr);
      if (todayLog) mood = todayLog.mood;
    }
    console.log(`[CONTROLLER LOG] Resolved mood: ${mood}`);

    const preferences = await Preferences.findOne({ userId: uid });
    const disabilities = preferences?.disabilities || [];
    const hasADHD = disabilities.includes(DISABILITY.ADHD);
    const hasAnxiety = disabilities.includes(DISABILITY.ANXIETY);
    const hasReadingWriting = disabilities.includes(DISABILITY.READING_WRITING);
    const hasEnergyPacing = disabilities.includes(DISABILITY.ENERGY_PACING);
    console.log(`[CONTROLLER LOG] Disabilities: ${disabilities.join(', ') || 'none'}`);

    // 3. Calculate load with disability modifiers
    let load = LOAD_MAP[mood];
    if (hasEnergyPacing) load = Math.max(1, load - 1);
    if (hasAnxiety && load > 2) load = 2;
    console.log(`[CONTROLLER LOG] Final load level: ${load}`);

    // 4. Fetch incomplete topics and rotate across courses
    const allTopics = await Topic.find({ userId: uid, isCompleted: false })
      .sort({ createdAt: 1 });

    const byCourse = allTopics.reduce((acc, topic) => {
      if (!acc[topic.courseId]) acc[topic.courseId] = [];
      acc[topic.courseId].push(topic);
      return acc;
    }, {});

    // Interleave topics across courses so no single course dominates
    const courseQueues = Object.values(byCourse);
    const rotatedTopics = [];
    const maxRounds = Math.max(...courseQueues.map((q) => q.length), 0);
    for (let i = 0; i < maxRounds; i++) {
      for (const queue of courseQueues) {
        if (queue[i]) rotatedTopics.push(queue[i]);
      }
    }

    // 5. Fetch incomplete assessments across all semesters
    const semesters = await Semester.find({ userId: uid });
    const allAssessments = semesters
      .flatMap((semester) =>
        semester.courses.flatMap((course) =>
          course.assessments
            .filter((a) => !a.isCompleted)
            .map((a) => ({
              ...a.toObject(),
              courseId: course._id,
              courseName: course.name,
              semesterId: semester._id,
              daysUntilDue: daysUntil(a.dueDate),
            }))
        )
      )
      .filter((a) => a.daysUntilDue >= 0) // ignore already passed ones
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    const urgentAssessments = allAssessments.filter((a) => a.daysUntilDue <= 7);
    const upcomingAssessments = allAssessments.filter((a) => a.daysUntilDue > 7 && a.daysUntilDue <= 14);

    // 6. Build task list
    const tasks = [];

    // Assessments — ADHD and anxiety always see urgent ones at top
    // On high load days everyone also sees the 14-day window
    const assessmentsToShow = [
      ...urgentAssessments,
      ...(load === 3 || hasADHD ? upcomingAssessments : []),
    ].slice(0, 3);

    for (const assessment of assessmentsToShow) {
      tasks.push({
        type: 'assessment',
        data: assessment,
        reason:
          assessment.daysUntilDue <= 3
            ? `Due in ${assessment.daysUntilDue} day${assessment.daysUntilDue === 1 ? '' : 's'} — make this a priority.`
            : `Coming up in ${assessment.daysUntilDue} days — good to start early.`,
      });
    }

    // Topics
    const selectedTopics = rotatedTopics.slice(0, load);
    for (const topic of selectedTopics) {
      tasks.push({
        type: 'topic',
        data: topic,
        reason:
          hasReadingWriting && topic.resourceLink
            ? 'Use the attached resource — visual or audio formats help here.'
            : 'Next up in sequence.',
      });

      // Quiz nudge — ADHD always gets one, others only on great days
      const shouldQuiz = hasADHD || (mood === 'great' && !hasAnxiety);
      if (shouldQuiz) {
        tasks.push({
          type: 'quiz',
          data: { topicTitle: topic.title },
          reason: hasADHD
            ? 'Quiz yourself after — active recall helps with ADHD.'
            : 'You have the energy for it — test what you know.',
        });
      }
    }

    // Rest nudge
    if (mood === 'overwhelmed' || hasEnergyPacing) {
      tasks.push({
        type: 'rest',
        reason:
          mood === 'overwhelmed'
            ? 'Rest is productive too. Take breaks between each task.'
            : 'Pace yourself — short breaks protect your energy.',
      });
    } else if (load === 3) {
      tasks.push({
        type: 'rest',
        reason: 'Take a 10-minute break between sessions to stay sharp.',
      });
    }

    const message = pickMessage(mood, disabilities);
    console.log(`[CONTROLLER LOG] Built ${tasks.length} task(s) for user: ${uid}`);

    res.json({ mood, message, tasks });
  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to generate recommendations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};