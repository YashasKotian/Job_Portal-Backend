import mongoose from "mongoose";

// Category Schema definition
const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, "Please provide a category name"],
      unique: true,
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Create and export Category model
const Category = mongoose.model("Category", categorySchema);
export default Category;
