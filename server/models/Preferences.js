// models/Preferences.js
import mongoose from 'mongoose';

const learningContextSchema = new mongoose.Schema({
  // Focus & Attention
  focusIssues:                    { type: Boolean, default: false },
  startingTasksIsHard:            { type: Boolean, default: false },
  losesTrackMidTask:              { type: Boolean, default: false },
  misjudgesTime:                  { type: Boolean, default: false },
  switchingTasksIsHard:           { type: Boolean, default: false },
  // Reading & Writing
  readingIsSlowOrDraining:        { type: Boolean, default: false },
  strugglesWithUnderstandingText: { type: Boolean, default: false },
  writingOrganizationIsHard:      { type: Boolean, default: false },
  spellingOrWordFindingIsHard:    { type: Boolean, default: false },
  // Energy & Pacing
  energyFluctuatesALot:           { type: Boolean, default: false },
  needsFrequentBreaks:            { type: Boolean, default: false },
  morningsAreHard:                { type: Boolean, default: false },
  eveningsAreHard:                { type: Boolean, default: false },
  canCrashAfterBusyDays:          { type: Boolean, default: false },
  // Anxiety & Overwhelm
  anxietyAroundSchoolTasks:       { type: Boolean, default: false },
  avoidsTasksDueToOverwhelm:      { type: Boolean, default: false },
  sensoryOverload:                { type: Boolean, default: false },
  suddenChangesAreHard:           { type: Boolean, default: false },
  groupSettingsAreDraining:       { type: Boolean, default: false },
}, { _id: false }); // _id: false because this is embedded, not its own collection

const schedulePreferencesSchema = new mongoose.Schema({
  preferredStudyTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'varies'],
    default: 'varies'
  },
  maxSessionMinutes: {
    type: Number,
    enum: [15, 25, 30, 45, 60],
    default: 25
  },
  breakFrequency: {
    type: String,
    enum: ['rare', 'normal', 'frequent'],
    default: 'normal'
  },
  prefersShortDeadlines: { type: Boolean, default: false },
  needsSoftReminders:    { type: Boolean, default: false },
}, { _id: false });

const VALID_PROFILES = [
  'Focus & Attention',
  'Reading & Writing',
  'Energy & Pacing',
  'Anxiety & Overwhelm',
  'Standard Track',
];

const preferencesSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true, unique: true },
  disabilities: {
    type: [String],
    enum: VALID_PROFILES,
    default: []
  },
  learningContext:      { type: learningContextSchema,      default: () => ({}) },
  schedulePreferences:  { type: schedulePreferencesSchema,  default: () => ({}) },
}, { timestamps: true });

export default mongoose.model('Preferences', preferencesSchema);