import express from "express";
import {
  applyForJob,
  getUserApplications,
  getAllApplications,
  updateApplicationStatus,
  getApplicationResume,
  withdrawApplication,
} from "../controllers/applicationController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Private routes
router.post("/apply/:jobId", verifyToken, applyForJob);
router.get("/user", verifyToken, getUserApplications);
router.get("/:id/resume", verifyToken, getApplicationResume);
router.delete("/:id", verifyToken, withdrawApplication);

// Admin routes
router.get("/admin/all", verifyToken, isAdmin, getAllApplications);
router.put("/status/:id", verifyToken, isAdmin, updateApplicationStatus);

export default router;
