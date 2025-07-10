import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    messageId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export default mongoose.model("Room", roomSchema);