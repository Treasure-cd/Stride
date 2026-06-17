import { Router } from 'express';
import { createSemester, getSemesters, updateSemester, checkSemester } from '../controllers/semester.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', createSemester);
router.get('/', getSemesters);
router.put('/:id', updateSemester)
router.get('/:userId/check', checkSemester);

export default router;