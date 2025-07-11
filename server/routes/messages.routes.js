import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { sendMessage } from "../controllers/messages.controller.js";

const router = express.Router();

router.post("/", verifyToken, sendMessage);

export default router;
