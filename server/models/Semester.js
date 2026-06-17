import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  weight: { type: Number, required: true }, // e.g., 30 for CA
  scoreAchieved: { type: Number }, // What they actually scored
  isCompleted: { type: Boolean, default: false }
});

const studyLinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true }
});


const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creditLoad: { type: Number, required: true },
  difficulty: { type: String, enum: ['low', 'medium', 'high'], required: true },
  themeColor: { type: String, default: '#4F46E5' },
  targetScore: { type: Number, default: 70 },
  gradingScheme: {
    continuousAssessment: { type: Number, default: 30 },
    exam: { type: Number, default: 70 }
  },
  postExamReflection: { type: String },
  assessments: [assessmentSchema],
  studyLinks: [studyLinkSchema] 
});

const semesterSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  courses: [courseSchema]
}, { timestamps: true });

// Pre-save hook for logging
semesterSchema.pre('save', function() {
  console.log(`[DB LOG] Saving semester: ${this.title} for user: ${this.userId}`);
  console.log(`[DB LOG] Course count: ${this.courses.length}`);
  console.log(`[DB LOG] Validating grading schemes...`);
});
export default mongoose.model('Semester', semesterSchema);