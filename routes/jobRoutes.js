import express from "express";
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllJobs);
router.get("/:id", getJobById);

// Private routes (Admin only)
router.post("/", verifyToken, isAdmin, createJob);
router.put("/:id", verifyToken, isAdmin, updateJob);
router.delete("/:id", verifyToken, isAdmin, deleteJob);

export default router;
