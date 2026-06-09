import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/index.js';
import preferencesRouter from './routes/preferences.routes.js';
import userRouter from './routes/user.routes.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/preferences', preferencesRouter);
app.use('/api/user', userRouter);

connectDB().then(() => {
  app.listen(3000, () => console.log('Server running'));
});