import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/index.js';
import preferencesRouter from './routes/preferences.routes.js';
import userRouter from './routes/user.routes.js';
import semesterRouter from './routes/semester.routes.js'
import notesRouter from './routes/notes.routes.js'
import generalStudyLinkRouter from './routes/generalStudyLinks.routes.js'
import topicRouter from './routes/topic.routes.js'
import moodRouter from './routes/mood.routes.js'

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/preferences', preferencesRouter);
app.use('/api/users', userRouter);
app.use('/api/semesters', semesterRouter);
app.use('/api/notes', notesRouter);
app.use('/api/general-study-links', generalStudyLinkRouter);
app.use('/api/topics', topicRouter);
app.use('/api/moods', moodRouter);

connectDB().then(() => {
  app.listen(3000, () => console.log('Server running'));
});