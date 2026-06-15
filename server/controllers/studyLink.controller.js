import Semester from "../models/Semester";

export const createStudyLink = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting createStudyLink execution...");
  try {
    const uid = req.user.uid;
    const { userId, courseId } = req.params;
    const { title, url } = req.body;

    if (uid !== userId) {
      console.warn(`[CONTROLLER WARN] Unauthorized study link creation attempt. User UID: ${uid}, Target: ${userId}`);
      return res.status(403).json({ message: "Unauthorized." });
    }

    console.log(`[CONTROLLER LOG] Creating study link for course: ${courseId}`);

    const semester = await Semester.findOneAndUpdate(
      { userId, 'courses._id': courseId },
      {
        $push: {
          'courses.$.studyLinks': { title, url }
        }
      },
      { new: true, runValidators: true }
    );

    if (!semester) {
      return res.status(404).json({ message: "Course not found." });
    }

    console.log(`[CONTROLLER LOG] Study link successfully created for course: ${courseId}`);
    res.status(201).json(semester);
  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to create study link:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteStudyLink = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting deleteStudyLink execution...");
  try {
    const uid = req.user.uid;
    const { userId, courseId, linkId } = req.params;

    if (uid !== userId) {
      console.warn(`[CONTROLLER WARN] Unauthorized study link deletion attempt. User UID: ${uid}, Target: ${userId}`);
      return res.status(403).json({ message: "Unauthorized." });
    }

    console.log(`[CONTROLLER LOG] Deleting study link: ${linkId} from course: ${courseId}`);

    const semester = await Semester.findOneAndUpdate(
      { userId, 'courses._id': courseId },
      {
        $pull: {
          'courses.$.studyLinks': { _id: linkId }
        }
      },
      { new: true }
    );

    if (!semester) {
      return res.status(404).json({ message: "Course not found." });
    }

    console.log(`[CONTROLLER LOG] Study link successfully deleted: ${linkId}`);
    res.json(semester);
  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to delete study link:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};