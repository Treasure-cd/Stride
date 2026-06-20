import express from 'express';
import { 
  createTopic, 
  getTopics, 
  updateTopic, 
  deleteTopic, 
  getAllTopics
} from '../controllers/topic.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/course/:courseId', getTopics);
router.post('/', createTopic);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);
router.get('/', getAllTopics)

export default router;