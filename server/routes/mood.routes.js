import express from 'express';
import { moodController } from '../controllers/mood.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();


router.use(authenticate);

router.get('/today', moodController.checkTodayStatus);
router.post('/', moodController.logMood);

export default router;