import Semester from "../models/Semester.js";

export const createAssessment = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting createAssessment execution...");
  try {
    const uid = req.user.uid;
    const { userId, courseId } = req.params;
    const { title, dueDate, weight } = req.body;

    // Authorization check
    if (uid !== userId) {
      console.warn(`[CONTROLLER WARN] Unauthorized assessment creation attempt. User UID: ${uid}, Target: ${userId}`);
      return res.status(403).json({ message: "Unauthorized." });
    }

    console.log(`[CONTROLLER LOG] Creating assessment for course: ${courseId}, user: ${userId}`);
    console.log("[CONTROLLER LOG] Assessment data:", { title, dueDate, weight });

    const semester = await Semester.findOneAndUpdate(
      { userId, 'courses._id': courseId },
      {
        $push: {
          'courses.$.assessments': {
            title,
            dueDate,
            weight,
            scoreAchieved: null,
            isCompleted: false
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!semester) {
      console.warn(`[CONTROLLER WARN] Course not found for assessment creation. Course ID: ${courseId}`);
      return res.status(404).json({ message: "Course not found." });
    }

    console.log(`[CONTROLLER LOG] Assessment successfully created for course: ${courseId}`);
    res.status(201).json(semester);
  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to create assessment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateAssessment = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting updateAssessment execution...");
  try {
    const uid = req.user.uid;
    const { userId, courseId, assessmentId } = req.params;
    const updateData = req.body;

    // Authorization check
    if (uid !== userId) {
      console.warn(`[CONTROLLER WARN] Unauthorized assessment update attempt. User UID: ${uid}, Target: ${userId}`);
      return res.status(403).json({ message: "Unauthorized." });
    }

    console.log(`[CONTROLLER LOG] Updating assessment: ${assessmentId} in course: ${courseId}`);
    console.log("[CONTROLLER LOG] Update payload:", updateData);

    const semester = await Semester.findOneAndUpdate(
      { userId, 'courses._id': courseId, 'courses.assessments._id': assessmentId },
      {
        $set: {
          'courses.$[course].assessments.$[assessment]': {
            ...updateData,
            _id: assessmentId // Preserve the ID
          }
        }
      },
      {
        arrayFilters: [
          { 'course._id': courseId },
          { 'assessment._id': assessmentId }
        ],
        new: true,
        runValidators: true
      }
    );

    if (!semester) {
      console.warn(`[CONTROLLER WARN] Assessment not found or unauthorized. Assessment ID: ${assessmentId}`);
      return res.status(404).json({ message: "Assessment not found or unauthorized." });
    }

    console.log(`[CONTROLLER LOG] Assessment successfully updated: ${assessmentId}`);
    res.json(semester);
  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to update assessment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteAssessment = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting deleteAssessment execution...");
  try {
    const uid = req.user.uid;
    const { userId, courseId, assessmentId } = req.params;

    // Authorization check
    if (uid !== userId) {
      console.warn(`[CONTROLLER WARN] Unauthorized assessment deletion attempt. User UID: ${uid}, Target: ${userId}`);
      return res.status(403).json({ message: "Unauthorized." });
    }

    console.log(`[CONTROLLER LOG] Deleting assessment: ${assessmentId} from course: ${courseId}`);

    const semester = await Semester.findOneAndUpdate(
      { userId, 'courses._id': courseId },
      {
        $pull: {
          'courses.$.assessments': { _id: assessmentId }
        }
      },
      { new: true }
    );

    if (!semester) {
      console.warn(`[CONTROLLER WARN] Course not found for assessment deletion. Course ID: ${courseId}`);
      return res.status(404).json({ message: "Course not found." });
    }

    console.log(`[CONTROLLER LOG] Assessment successfully deleted: ${assessmentId}`);
    res.json(semester);
  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to delete assessment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
