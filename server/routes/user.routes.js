import { Router } from 'express';
import { createUser, getUser } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', createUser);
router.get('/', getUser);

export default router;