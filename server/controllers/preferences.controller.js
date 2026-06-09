import Preferences from '../models/Preferences.js';

export const createPreferences = async (req, res) => {
  try {
    const userId = req.user.uid; 

    const existing = await Preferences.findOne({ userId });
    if (existing) {
      return res.status(409).json({ error: 'Preferences already exist for this user' });
    }

    const preferences = await Preferences.create({
      userId,
      ...req.body
    });

    res.status(201).json(preferences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPreferences = async (req, res) => {
  try {
    const preferences = await Preferences.findOne({ userId: req.user.uid });

    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    res.json(preferences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const preferences = await Preferences.findOneAndUpdate(
      { userId: req.user.uid },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    res.json(preferences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};