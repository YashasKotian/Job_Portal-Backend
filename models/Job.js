import mongoose from "mongoose";

// Job Schema definition
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide job title"],
      trim: true,
      maxlength: [100, "Job title cannot exceed 100 characters"],
    },
    company: {
      type: String,
      required: [true, "Please provide company name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide job description"],
    },
    requirements: {
      type: String,
      default: "",
    },
    salary: {
      type: Number,
      required: [true, "Please provide salary"],
    },
    salaryType: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    location: {
      type: String,
      required: [true, "Please provide location"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      default: "full-time",
    },
    experience: {
      type: String,
      default: "0-1 years",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export Job model
const Job = mongoose.model("Job", jobSchema);
export default Job;
