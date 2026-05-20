import Category from "../models/Category.js";

// @route   GET /api/category
// @desc    Get all categories
// @access  Public
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/category/:id
// @desc    Get category by id
// @access  Public
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/category
// @desc    Create new category
// @access  Private (Admin only)
export const createCategory = async (req, res, next) => {
  try {
    const { categoryName, description } = req.body;

    // Validate input
    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Please provide category name",
      });
    }

    // Create category
    const category = await Category.create({
      categoryName,
      description: description || "",
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/category/:id
// @desc    Update category
// @access  Private (Admin only)
export const updateCategory = async (req, res, next) => {
  try {
    const { categoryName, description } = req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Update fields
    category.categoryName = categoryName || category.categoryName;
    category.description = description !== undefined ? description : category.description;

    category = await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/category/:id
// @desc    Delete category
// @access  Private (Admin only)
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
