import MoodTracker from '../models/MoodTracker.js';

// Helper to get today's date safely as 'YYYY-MM-DD'
const getTodayString = () => {
  const date = new Date();
  // Adjusts for local timezone offset so 'today' is accurate to the user
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

export const moodController = {
  // GET /api/moods/today
  checkTodayStatus: async (req, res) => {
    try {
      const uid = req.user.uid;
      const today = getTodayString();

      const tracker = await MoodTracker.findOne({ userId: uid });
      
      if (!tracker) {
        return res.status(200).json({ hasLoggedToday: false, mood: null });
      }

      const todayLog = tracker.logs.find(log => log.dateString === today);

      if (todayLog) {
        return res.status(200).json({ hasLoggedToday: true, mood: todayLog.mood });
      }

      return res.status(200).json({ hasLoggedToday: false, mood: null });
    } catch (error) {
      console.error("[DB ERROR] Failed to check mood status:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  // POST /api/moods
  logMood: async (req, res) => {
    try {
      const uid = req.user.uid;
      const { mood } = req.body;
      const today = getTodayString();

      if (!['overwhelmed', 'neutral', 'great'].includes(mood)) {
        return res.status(400).json({ message: "Invalid mood state." });
      }

      let tracker = await MoodTracker.findOne({ userId: uid });

      // If user has no tracker document yet, create one
      if (!tracker) {
        tracker = await MoodTracker.create({
          userId: uid,
          logs: [{ dateString: today, mood }]
        });
        return res.status(201).json(tracker);
      }

      // Check if they already logged today
      const existingLogIndex = tracker.logs.findIndex(log => log.dateString === today);

      if (existingLogIndex >= 0) {
        // Update today's mood (User changed their mind)
        tracker.logs[existingLogIndex].mood = mood;
        tracker.logs[existingLogIndex].timestamp = new Date();
      } else {
        // Add a new log for today
        tracker.logs.push({ dateString: today, mood });
      }

      await tracker.save();
      return res.status(200).json(tracker);

    } catch (error) {
      console.error("[DB ERROR] Failed to log mood:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
};