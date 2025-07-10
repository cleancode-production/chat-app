import express from "express";
import { getAllContacts } from "../controllers/contact.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getAllContacts);

export default router;
