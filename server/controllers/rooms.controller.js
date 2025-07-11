import Room from "../models/roomModel.js";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";

export const getAllRooms = async (req, res, next) => {
  const userId = req.userId;

  try {
    const rooms = await Room.find({ participants: userId }).populate(
      "participants",
      "username imgUrl"
    );

    if (!rooms) {
      const error = new Error("Keinen Raum gefunden");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(rooms);
  } catch (error) {
    return next(error);
  }
};

export const getRoomById = async (req, res, next) => {
  const userId = req.userId;
  const roomId = req.params.roomId;

  if (!roomId) {
    const error = new Error("Keine Raum Id vorhanden");
    error.statusCode = 404;
    return next(error);
  }
  try {
    const room = await Room.findById(roomId)
      .populate("participants", "username imgUrl")
      .populate({
        path: "messages",
        model: "Message",
        select: "text createdAt senderId",
        options: { sort: { createdAt: 1 } },
        populate: {
          path: "senderId",
          select: "username imgUrl",
        },
      });

    if (!room) {
      const error = new Error("Keine Raum Id vorhanden");
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json(room);
  } catch (error) {
    return next(error);
  }
};

export const createRoom = async (req, res, next) => {
  let { name, contactId } = req.body;
  const userId = req.userId;

  try {
    if (!contactId) {
      const error = new Error("Kontakt-ID fehlt");
      error.statusCode = 400;
      return next(error);
    }

    if (!name) name = "your Chat";

    const newRoom = await Room.create({
      name,
      participants: [userId, contactId],
    });

    const user = await User.findById(userId);
    const contact = await User.findById(contactId);

    if (!user || !contact) {
      const error = new Error("User nicht gefunden");
      error.statusCode = 404;
      return next(error);
    }

    user.rooms.push(newRoom._id);
    contact.rooms.push(newRoom._id);

    await user.save();
    await contact.save();

    const populatedRoom = await newRoom.populate(
      "participants",
      "username imgUrl"
    );

    return res.status(201).json(populatedRoom);
  } catch (error) {
    return next(error);
  }
};

export const addContactToRoom = async (req, res, next) => {
  const { roomId, contactId } = req.body;
  const userId = req.userId;

  try {
    if (!roomId || !contactId) {
      const error = new Error("roomId und contactId sind erforderlich");
      error.statusCode = 400;
      return next(error);
    }

    const room = await Room.findById(roomId);
    if (!room) {
      const error = new Error("Raum nicht gefunden");
      error.statusCode = 404;
      return next(error);
    }

    const contact = await User.findById(contactId);
    if (!contact) {
      const error = new Error("Kontakt nicht gefunden");
      error.statusCode = 404;
      return next(error);
    }

    // Prüfen, ob der Kontakt schon Teilnehmer ist
    if (room.participants.includes(contactId)) {
      res.status(400).json({ message: "Kontakt ist bereits im Raum" });
      return;
    }

    // Kontakt zum Raum hinzufügen
    room.participants.push(contactId);
    await room.save();

    // Raum auch beim Kontakt speichern
    contact.rooms.push(room._id);
    await contact.save();

    const updatedRoom = await room.populate("participants", "username imgUrl");

    return res.status(200).json(updatedRoom);
  } catch (error) {
    return next(error);
  }
};
