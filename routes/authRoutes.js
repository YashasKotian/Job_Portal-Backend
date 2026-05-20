import express from "express";
import {
  register,
  login,
  getCurrentUser,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Private routes
router.get("/me", verifyToken, getCurrentUser);

export default router;
