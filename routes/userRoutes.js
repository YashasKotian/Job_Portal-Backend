import express from "express";
import {
  getAllUsers,
  getUserById,
  updateProfile,
  uploadResume,
  downloadResume,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import upload from "../utils/multer.js";

const router = express.Router();

// Public routes
router.get("/:id", verifyToken, getUserById);

// Private routes
router.put("/profile/:id", verifyToken, updateProfile);
router.post("/upload-resume", verifyToken, upload.single("resume"), uploadResume);
router.get("/download-resume/:filename", verifyToken, downloadResume);

// Admin routes
router.get("/", verifyToken, isAdmin, getAllUsers);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
