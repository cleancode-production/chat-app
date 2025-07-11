import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: String, required: true },
});

export default mongoose.model("Message", messageSchema);
