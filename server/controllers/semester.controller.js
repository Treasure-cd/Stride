import Semester from "../models/Semester.js";

export const createSemester = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting createSemester execution...");
  try {
    const uid = req.user.uid; 
    const { title, startDate, endDate, courses } = req.body;

    console.log("[CONTROLLER LOG] Extracted UID:", uid);
    console.log("[CONTROLLER LOG] Payload received:", { 
      title, 
      startDate, 
      endDate, 
      courseCount: courses ? courses.length : 0 
    });

    const semester = await Semester.create({
      userId: uid,
      title,
      startDate,
      endDate,
      courses: courses || []
    });

    console.log("[CONTROLLER LOG] Semester doc successfully created in DB with ID:", semester._id);
    res.status(201).json(semester);
    
  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to create semester:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getSemesters = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting getSemesters execution...");
  try {
    const uid = req.user.uid;
    console.log("[CONTROLLER LOG] Fetching semesters for user UID:", uid);

    // Sort by newest startDate first
    const semesters = await Semester.find({ userId: uid }).sort({ startDate: -1 });
    
    console.log(`[CONTROLLER LOG] Successfully retrieved ${semesters.length} semester(s) from DB.`);
    res.json(semesters);

  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to fetch semesters:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateSemester = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting updateSemester execution...");
  try {
    const uid = req.user.uid;
    const { id } = req.params;
    const { title, startDate, endDate, courses } = req.body;

    console.log(`[CONTROLLER LOG] Target Semester ID: ${id} | User UID: ${uid}`);
    console.log("[CONTROLLER LOG] Update data payload:", { title, startDate, endDate, courseCount: courses?.length });

    // Build update object with only provided fields
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (startDate !== undefined) updateFields.startDate = startDate;
    if (endDate !== undefined) updateFields.endDate = endDate;
    if (courses !== undefined) updateFields.courses = courses;

    const updatedSemester = await Semester.findOneAndUpdate(
      { _id: id, userId: uid },
      updateFields,  // Only the fields that were sent
      { new: true, runValidators: true }
    );

    if (!updatedSemester) {
      console.warn(`[CONTROLLER WARN] Semester update aborted. No match found or unauthorized for ID: ${id}`);
      return res.status(404).json({ message: "Semester not found or unauthorized." });
    }

    console.log("[CONTROLLER LOG] Semester doc successfully updated in DB for ID:", updatedSemester._id);
    res.json(updatedSemester);
  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to update semester:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
export const checkSemester = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting checkSemester execution...");
  try {
    const uid = req.user.uid;
    const { userId } = req.params;

    // Authorization check
    if (uid !== userId) {
      console.warn(`[CONTROLLER WARN] Unauthorized semester check attempt. User UID: ${uid}, Target: ${userId}`);
      return res.status(403).json({ message: "Unauthorized." });
    }

    console.log(`[CONTROLLER LOG] Checking semester status for user: ${userId}`);

    const semester = await Semester.findOne({ userId });

    if (!semester) {
      console.log(`[CONTROLLER LOG] No semester found for user: ${userId}`);
      return res.json({ 
        hasSemester: false,
        semester: null
      });
    }

    console.log(`[CONTROLLER LOG] Semester found for user: ${userId}, ID: ${semester._id}`);
    res.json({
      hasSemester: true,
      semester: {
        _id: semester._id,
        title: semester.title,
        startDate: semester.startDate,
        endDate: semester.endDate,
        courseCount: semester.courses.length
      }
    });
  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to check semester:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};