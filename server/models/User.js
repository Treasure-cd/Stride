import mongoose from 'mongoose';

//schemas are exactly how the shape of the data will be. using mongo's raw driver wouldn't work for defining these.
const userSchema = new mongoose.Schema({
  _id: { type: String },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  profile: {
    name: { type: String },
    institution: { type: String }
  }
});

export default mongoose.model('User', userSchema);