import Message from "../models/messageModel.js";
import Room from "../models/roomModel.js";

export const sendMessage = async (req, res, next) => {
  const { text, roomId } = req.body;
  const senderId = req.userId;

  try {
    if (!text || !roomId) {
      const error = new Error("Text und Raum-ID sind erforderlich");
      error.statusCode = 400;
      return next(error);
    }

    const room = await Room.findById(roomId);
    if (!room) {
      const error = new Error("Raum nicht gefunden");
      error.statusCode = 404;
      return next(error);
    }

    const newMessage = await Message.create({
      text,
      sender: senderId,
      createdAt: new Date().toISOString(),
    });

    room.messages.push(newMessage._id);
    await room.save();

    const populatedMessage = await newMessage.populate(
      "sender",
      "username imgUrl"
    );

    return res.status(201).json(populatedMessage);
  } catch (error) {
    return next(error);
  }
};
