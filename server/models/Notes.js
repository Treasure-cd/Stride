import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, default: 'Untitled Note' },
  content: { type: String, default: '' },
  

  isPinned: { type: Boolean, default: false } 
}, { timestamps: true });

noteSchema.pre('save', function() {
  console.log(`[DB LOG] General Note saved/updated for user: ${this.userId} | Pinned: ${this.isPinned}`);
});

export default mongoose.model('Note', noteSchema);