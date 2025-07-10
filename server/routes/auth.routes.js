import express from "express";
import {
  loginUser,
  registerUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);

export default router;
