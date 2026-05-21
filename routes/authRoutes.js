import express from "express";
import {
  register,
  login,
  getCurrentUser,
  createAdminAccount,
  seedDemoAdmin,
} from "../controllers/authController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/seed-demo-admin", seedDemoAdmin); // Seed demo admin if none exists

// Private routes
router.get("/me", verifyToken, getCurrentUser);

// Admin only routes
router.post("/create-admin", verifyToken, isAdmin, createAdminAccount);

export default router;
