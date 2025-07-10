import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    text: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    createdAt: { type: String, required: true }
});

export default mongoose.model("Message", messageSchema);