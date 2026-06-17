import GeneralStudyLink from '../models/GeneralStudyLink.js';

export const generalLinkController = {
  // GET /api/general-study-links/semester/:semesterId
  getBySemester: async (req, res) => {
    try {
      const { semesterId } = req.params;
      const links = await GeneralStudyLink.find({ semesterId }).sort({ createdAt: -1 });
      res.status(200).json(links);
    } catch (error) {
      console.error("[DB ERROR] Failed to fetch general study links:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  // POST /api/general-study-links
  create: async (req, res) => {
    try {
      const userId = req.user.uid; // Assuming you have an auth middleware setting this
      const { semesterId, title, url } = req.body;

      if (!semesterId || !title || !url) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      const newLink = await GeneralStudyLink.create({
        userId,
        semesterId,
        title,
        url
      });

      res.status(201).json(newLink);
    } catch (error) {
      console.error("[DB ERROR] Failed to create general study link:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  // DELETE /api/general-study-links/:id
  remove: async (req, res) => {
    try {
      const { id } = req.params;
      await GeneralStudyLink.findByIdAndDelete(id);
      res.status(200).json({ message: "Link deleted successfully." });
    } catch (error) {
      console.error("[DB ERROR] Failed to delete general study link:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
};