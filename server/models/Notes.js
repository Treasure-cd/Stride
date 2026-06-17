import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  semesterId: { type: String, required: true, index: true },
  content: { type: String, default: '' },
  color: { type: String, default: '#6d28d9' }
}, { timestamps: true });


noteSchema.pre('save', function() {
  console.log(`[DB LOG] General Note saved/updated for user: ${this.userId} | Pinned: ${this.isPinned}`);
});

export default mongoose.model('Note', noteSchema);