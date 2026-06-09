import { Router } from 'express';
import { createPreferences, getPreferences, updatePreferences } from '../controllers/preferences.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', createPreferences);
router.get('/', getPreferences);
router.patch('/', updatePreferences);

export default router;