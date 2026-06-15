import { Router } from 'express';
import { createSemester, getSemesters, updateSemester } from '../controllers/semester.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', createSemester);
router.get('/', getSemesters);
router.put('/', updateSemester)

export default router;