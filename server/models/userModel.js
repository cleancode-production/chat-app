import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    hashedPassword: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    imgUrl: { type: String },
    createdAt: { type: String },
    lastChange: { type: String }
});

export default mongoose.model("User", userSchema);