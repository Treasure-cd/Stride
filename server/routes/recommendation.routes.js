import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendation.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.get('/', getRecommendations);

export default router;