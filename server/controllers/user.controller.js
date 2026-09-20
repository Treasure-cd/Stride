import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    const uid = req.user.uid; 
    const { email, profile } = req.body;
    const user = await User.create({
      _id: uid, 
      email,
      profile: {
        name: profile.name,
        institution: profile.institution
      }
    });

    res.status(201).json(user);
    
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists." });
    }
    res.status(500).json({ message: "Internal server error." });
  }
};


export const getUser = async (req, res) => {
  const user = await User.findById(req.user.uid);
  res.json(user);
};

export const addProfilePicture = async (req, res) => {
  try {
    const { avatarUrl } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.uid,
      { 'profile.avatarUrl': avatarUrl },
      { new: true }
    )
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(user)
  } catch (error) {
    console.error('Error updating avatar:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
}