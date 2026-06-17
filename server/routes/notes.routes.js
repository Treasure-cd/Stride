import express from 'express';
import { noteController } from '../controllers/notes.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/semester/:semesterId', noteController.getBySemester);
router.post('/save', noteController.saveNote);
router.delete('/:id', noteController.deleteNote);

export default router;