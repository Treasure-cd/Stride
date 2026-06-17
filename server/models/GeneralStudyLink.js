import mongoose from 'mongoose';

const generalStudyLinkSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  semesterId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  url: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('GeneralStudyLink', generalStudyLinkSchema);