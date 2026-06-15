import Semester from "../models/Semester.js";

export const createCourse = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting createCourse execution...");
  try {
    const uid = req.user.uid;
    const { userId } = req.params;
    const { name, creditLoad, difficulty, themeColor, targetScore, gradingScheme } = req.body;

    // Authorization check
    if (uid !== userId) {
      console.warn(`[CONTROLLER WARN] Unauthorized course creation attempt. User UID: ${uid}, Target: ${userId}`);
      return res.status(403).json({ message: "Unauthorized." });
    }

    console.log(`[CONTROLLER LOG] Creating course for user: ${userId}`);
    console.log("[CONTROLLER LOG] Course data:", { name, creditLoad, difficulty });

    const semester = await Semester.findOneAndUpdate(
      { userId },
      {
        $push: {
          courses: {
            name,
            creditLoad,
            difficulty,
            themeColor: themeColor || '#4F46E5',
            targetScore: targetScore || 70,
            gradingScheme: gradingScheme || { continuousAssessment: 30, exam: 70 },
            assessments: [],
            studyLinks: []
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!semester) {
      console.warn(`[CONTROLLER WARN] Semester not found for user: ${userId}`);
      return res.status(404).json({ message: "Semester not found." });
    }

    console.log(`[CONTROLLER LOG] Course successfully added. New course count: ${semester.courses.length}`);
    res.status(201).json(semester);
  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to create course:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateCourse = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting updateCourse execution...");
  try {
    const uid = req.user.uid;
    const { userId, courseId } = req.params;
    const updateData = req.body;

    // Authorization check
    if (uid !== userId) {
      console.warn(`[CONTROLLER WARN] Unauthorized course update attempt. User UID: ${uid}, Target: ${userId}`);
      return res.status(403).json({ message: "Unauthorized." });
    }

    console.log(`[CONTROLLER LOG] Updating course: ${courseId} for user: ${userId}`);
    console.log("[CONTROLLER LOG] Update payload:", updateData);

    const semester = await Semester.findOneAndUpdate(
      { userId, 'courses._id': courseId },
      {
        $set: {
          'courses.$': {
            ...updateData,
            _id: courseId // Preserve the ID
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!semester) {
      console.warn(`[CONTROLLER WARN] Course not found or unauthorized. Course ID: ${courseId}`);
      return res.status(404).json({ message: "Course not found or unauthorized." });
    }

    console.log(`[CONTROLLER LOG] Course successfully updated: ${courseId}`);
    res.json(semester);
  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to update course:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteCourse = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting deleteCourse execution...");
  try {
    const uid = req.user.uid;
    const { userId, courseId } = req.params;

    // Authorization check
    if (uid !== userId) {
      console.warn(`[CONTROLLER WARN] Unauthorized course deletion attempt. User UID: ${uid}, Target: ${userId}`);
      return res.status(403).json({ message: "Unauthorized." });
    }

    console.log(`[CONTROLLER LOG] Deleting course: ${courseId} for user: ${userId}`);

    const semester = await Semester.findOneAndUpdate(
      { userId },
      {
        $pull: {
          courses: { _id: courseId }
        }
      },
      { new: true }
    );

    if (!semester) {
      console.warn(`[CONTROLLER WARN] Semester not found for user: ${userId}`);
      return res.status(404).json({ message: "Semester not found." });
    }

    console.log(`[CONTROLLER LOG] Course successfully deleted. Remaining course count: ${semester.courses.length}`);
    res.json(semester);
  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to delete course:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


