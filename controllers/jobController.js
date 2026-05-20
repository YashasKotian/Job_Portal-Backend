import Job from "../models/Job.js";
import Category from "../models/Category.js";

// @route   GET /api/job
// @desc    Get all jobs with filtering and search
// @access  Public
export const getAllJobs = async (req, res, next) => {
  try {
    const {
      category,
      location,
      jobType,
      searchTerm,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    if (searchTerm) {
      filter.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { company: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Get jobs
    const jobs = await Job.find(filter)
      .populate("category", "categoryName")
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    // Get total count
    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/job/:id
// @desc    Get job by id
// @access  Public
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("category", "categoryName")
      .populate("createdBy", "name email company");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/job
// @desc    Create new job
// @access  Private (Admin only)
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      description,
      requirements,
      salary,
      salaryType,
      location,
      category,
      jobType,
      experience,
    } = req.body;

    // Validate required fields
    if (!title || !company || !description || !salary || !location || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    // Create job
    const job = await Job.create({
      title,
      company,
      description,
      requirements: requirements || "",
      salary,
      salaryType: salaryType || "monthly",
      location,
      category,
      jobType: jobType || "full-time",
      experience: experience || "0-1 years",
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/job/:id
// @desc    Update job
// @access  Private (Admin only)
export const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is admin or job creator
    if (req.user.role !== "admin" && job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this job",
      });
    }

    // Update allowed fields
    const allowedFields = [
      "title",
      "company",
      "description",
      "requirements",
      "salary",
      "salaryType",
      "location",
      "category",
      "jobType",
      "experience",
      "isActive",
    ];

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        job[key] = req.body[key];
      }
    });

    job = await job.save();

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/job/:id
// @desc    Delete job
// @access  Private (Admin only)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is admin or job creator
    if (req.user.role !== "admin" && job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this job",
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
