import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  hashedPassword: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  imgUrl: { type: String },
  refreshToken: { type: String },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  createdAt: { type: String },
  lastChange: { type: String },
  isOnline: { type: Boolean, required: true, default: false },
});

export default mongoose.model("User", userSchema);
