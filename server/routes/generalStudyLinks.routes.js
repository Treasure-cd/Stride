import express from 'express';
import { generalLinkController } from '../controllers/generalStudyLink.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/semester/:semesterId', generalLinkController.getBySemester);
router.post('/', generalLinkController.create);
router.delete('/:id', generalLinkController.remove);

export default router;