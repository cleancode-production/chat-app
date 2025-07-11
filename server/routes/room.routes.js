import express from "express";

import {
  getAllRooms,
  getRoomById,
  createRoom,
  addContactToRoom,
} from "../controllers/rooms.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getAllRooms);
router.get("/:roomId", verifyToken, getRoomById);
router.post("/", verifyToken, createRoom);
router.post("/addContact", verifyToken, addContactToRoom);

export default router;
