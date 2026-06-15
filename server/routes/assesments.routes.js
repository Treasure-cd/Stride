import { Router } from "express";
import { createAssessment, updateAssessment, deleteAssessment } from "../controllers/assesment.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);


router.post('/:userId/courses/:courseId/assessments', createAssessment);
router.put('/:userId/courses/:courseId/assessments/:assessmentId', updateAssessment);
router.delete('/:userId/courses/:courseId/assessments/:assessmentId', deleteAssessment);

export default router;