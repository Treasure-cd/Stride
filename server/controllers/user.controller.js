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