import mongoose from 'mongoose';

const moodLogSchema = new mongoose.Schema({
  dateString: { type: String, required: true }, // Format: 'YYYY-MM-DD'
  mood: {
    type: String,
    enum: ['overwhelmed', 'neutral', 'great'],
    required: true
  },
  timestamp: { type: Date, default: Date.now }
});

const moodTrackerSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  logs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MoodLog'
  }]
}, { timestamps: true });

export const MoodLog = mongoose.model('MoodLog', moodLogSchema);
export const MoodTracker = mongoose.model('MoodTracker', moodTrackerSchema);
