import Topic from "../models/StudyTask.js";

export const createTopic = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting createTopic execution...");
  try {
    const uid = req.user.uid;
    const { semesterId, courseId, title, resourceLink } = req.body;

    console.log("[CONTROLLER LOG] Extracted UID:", uid);
    console.log("[CONTROLLER LOG] Payload received:", { semesterId, courseId, title, resourceLink });

    if (!semesterId || !courseId || !title) {
      console.warn("[CONTROLLER WARN] Missing required fields for topic creation.");
      return res.status(400).json({ message: "Semester ID, Course ID, and Title are required." });
    }

    const topic = await Topic.create({
      userId: uid,
      semesterId,
      courseId,
      title,
      resourceLink: resourceLink || ''
    });

    console.log("[CONTROLLER LOG] Topic successfully created in DB with ID:", topic._id);
    res.status(201).json(topic);

  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to create topic:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const getTopics = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting getTopics execution...");
  try {
    const uid = req.user.uid;
    // 👇 CHANGED: Grab courseId from req.params to match your frontend api.ts
    const { courseId } = req.params; 

    console.log(`[CONTROLLER LOG] Fetching topics for user: ${uid}, course: ${courseId}`);

    const topics = await Topic.find({ 
      userId: uid, 
      courseId: courseId 
    }).sort({ isCompleted: 1, createdAt: 1 });

    console.log(`[CONTROLLER LOG] Successfully retrieved ${topics.length} topic(s) from DB.`);
    res.json(topics);

  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to fetch topics:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const deleteTopic = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting deleteTopic execution...");
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    const deletedTopic = await Topic.findOneAndDelete({ _id: id, userId: uid });

    if (!deletedTopic) {
      return res.status(404).json({ message: "Topic not found or unauthorized." });
    }

    console.log("[CONTROLLER LOG] Topic successfully deleted:", id);
    res.json({ message: "Topic deleted successfully." });

  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to delete topic:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const updateTopic = async (req, res) => {
  console.log("[CONTROLLER LOG] Starting updateTopic execution...");
  try {
    const uid = req.user.uid;
    const { id } = req.params;
    const updates = req.body;

    console.log(`[CONTROLLER LOG] Target Topic ID: ${id} | User UID: ${uid}`);
    console.log("[CONTROLLER LOG] Fields to update:", updates);

    // If the frontend is checking an item off, automatically calculate variables
    if (updates.isCompleted === true) {
      updates.completedAt = new Date();
      updates.status = 'mastered';
      console.log("[CONTROLLER LOG] Intercepted task completion. Setting completion timestamp and status to 'mastered'.");
    } else if (updates.isCompleted === false) {
      updates.completedAt = null;
      updates.status = 'backlog';
      console.log("[CONTROLLER LOG] Intercepted task un-completion. Reverting timestamp and status to 'backlog'.");
    }

    const updatedTopic = await Topic.findOneAndUpdate(
      { _id: id, userId: uid },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedTopic) {
      console.warn(`[CONTROLLER WARN] Topic update aborted. No match found or unauthorized for ID: ${id}`);
      return res.status(404).json({ message: "Topic not found or unauthorized." });
    }

    console.log("[CONTROLLER LOG] Topic successfully updated in DB for ID:", updatedTopic._id);
    res.json(updatedTopic);

  } catch (error) {
    console.error("[CONTROLLER ERROR] Failed to update topic:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};