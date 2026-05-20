import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";

// @route   POST /api/application/apply/:jobId
// @desc    Apply for a job
// @access  Private
export const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Get user to check resume
    const user = await User.findById(userId);
    if (!user.resume) {
      return res.status(400).json({
        success: false,
        message: "Please upload resume before applying",
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      userId,
      jobId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Create application
    const application = await Application.create({
      userId,
      jobId,
      resumePath: user.resume,
      coverLetter: req.body.coverLetter || "",
    });

    // Increment application count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/application/user
// @desc    Get user's applications
// @access  Private
export const getUserApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { userId };

    if (status) {
      filter.status = status;
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const applications = await Application.find(filter)
      .populate("jobId", "title company location salary")
      .skip(skip)
      .limit(limitNum)
      .sort({ appliedAt: -1 });

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/application/admin
// @desc    Get all applications (admin)
// @access  Private (Admin only)
export const getAllApplications = async (req, res, next) => {
  try {
    const { status, jobId, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (jobId) {
      filter.jobId = jobId;
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const applications = await Application.find(filter)
      .populate("userId", "name email phone")
      .populate("jobId", "title company location")
      .populate("reviewedBy", "name")
      .skip(skip)
      .limit(limitNum)
      .sort({ appliedAt: -1 });

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/application/status/:id
// @desc    Update application status
// @access  Private (Admin only)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    let application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/application/:id/resume
// @desc    Get application resume
// @access  Private
export const getApplicationResume = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Send file path for frontend to download
    res.status(200).json({
      success: true,
      resumePath: application.resumePath,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/application/:id
// @desc    Withdraw application
// @access  Private
export const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check if user owns the application
    if (application.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to withdraw this application",
      });
    }

    // Only allow withdrawal if pending
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot withdraw application with status: " + application.status,
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    // Decrement application count
    await Job.findByIdAndUpdate(application.jobId, {
      $inc: { applicationCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error) {
    next(error);
  }
};
