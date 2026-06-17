import Note from '../models/Notes.js';

export const noteController = {
  // GET /api/notes/semester/:semesterId
  getBySemester: async (req, res) => {
    try {
      const { semesterId } = req.params;
      const notes = await Note.find({ semesterId }).sort({ createdAt: -1 });
      return res.status(200).json(notes);
    } catch (error) {
      console.error("[DB ERROR] Failed to fetch notes:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  },

  // POST /api/notes/save (Handles both Create & Update)
  saveNote: async (req, res) => {
    try {
      const userId = req.user.uid; // Grab from auth middleware
      const { noteId, semesterId, content, color } = req.body;

      if (!semesterId) {
        return res.status(400).json({ error: "semesterId is required." });
      }

      // If we pass an ID, update it
      if (noteId) {
        const updatedNote = await Note.findByIdAndUpdate(
          noteId,
          { content, color },
          { new: true }
        );
        return res.status(200).json(updatedNote);
      }

      // Otherwise, create a new one
      const newNote = await Note.create({
        userId,
        semesterId,
        content,
        color
      });

      return res.status(201).json(newNote);
    } catch (error) {
      console.error("[DB ERROR] Failed to save note:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  },

  // DELETE /api/notes/:id
  deleteNote: async (req, res) => {
    try {
      const { id } = req.params;
      await Note.findByIdAndDelete(id);
      return res.status(200).json({ message: "Note deleted successfully." });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};