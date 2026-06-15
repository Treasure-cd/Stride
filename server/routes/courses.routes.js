import { Router } from "express";
import { createCourse, updateCourse, deleteCourse } from "../controllers/courses.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post('/:userId/courses', createCourse);
router.put('/:userId/courses/:courseId', updateCourse);
router.delete('/:userId/courses/:courseId', deleteCourse);

export default router;