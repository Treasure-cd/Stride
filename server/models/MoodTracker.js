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
  logs: [moodLogSchema]
}, { timestamps: true });

export default mongoose.model('MoodTracker', moodTrackerSchema);