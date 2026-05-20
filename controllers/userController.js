import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory (ES modules workaround)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @route   GET /api/user
// @desc    Get all users (admin only)
// @access  Private (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (role) {
      filter.role = role;
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/user/:id
// @desc    Get user by id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/user/profile/:id
// @desc    Update user profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check authorization
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile",
      });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/user/upload-resume
// @desc    Upload resume
// @access  Private
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Get user and remove old resume if exists
    const user = await User.findById(req.user.id);

    if (user.resume) {
      const oldFilePath = path.join(__dirname, "../", user.resume);
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (err) {
        console.log("Error deleting old resume:", err);
      }
    }

    // Save new resume path
    const resumePath = `uploads/${req.file.filename}`;
    user.resume = resumePath;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: resumePath,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/user/download-resume/:filename
// @desc    Download resume
// @access  Private
export const downloadResume = async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, "../uploads", filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.download(filepath);
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/user/:id
// @desc    Delete user
// @access  Private (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete resume file if exists
    if (user.resume) {
      const filepath = path.join(__dirname, "../", user.resume);
      try {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      } catch (err) {
        console.log("Error deleting resume file:", err);
      }
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
