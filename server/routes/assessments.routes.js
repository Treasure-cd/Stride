import { Router } from "express";
import { createAssessment, updateAssessment, deleteAssessment, getAllAssessments } from "../controllers/assessment.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);


router.post('/:userId/courses/:courseId/assessments', createAssessment);
router.put('/:userId/courses/:courseId/assessments/:assessmentId', updateAssessment);
router.delete('/:userId/courses/:courseId/assessments/:assessmentId', deleteAssessment);
router.get('/', getAllAssessments)


export default router;