import { Router } from "express";
import { createStudyLink, deleteStudyLink } from "../controllers/studyLink.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post('/:userId/courses/:courseId/study-links', createStudyLink);
router.delete('/:userId/courses/:courseId/study-links/:linkId', deleteStudyLink);

export default router;
