import express from "express";
import {
  loginUser,
  registerUser,
  refreshAccessToken,
  logoutUser,
  getMe,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/me", verifyToken, getMe);

export default router;
