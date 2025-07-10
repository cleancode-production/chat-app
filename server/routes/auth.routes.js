import express from "express";
import { loginUser } from "../controllers/auth.controller.js";
import { registerUser } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;
