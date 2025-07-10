import express from "express";
import {
  getAllContacts,
  addContact,
  removeContact,
} from "../controllers/contact.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getAllContacts);
router.post("/", verifyToken, addContact);
router.delete("/", verifyToken, removeContact);

export default router;
