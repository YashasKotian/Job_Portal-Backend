import jwt from "jsonwebtoken";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only",
    });
  }
  next();
};

// Middleware to check if user is owner or admin
export const isOwnerOrAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.id !== req.params.userId) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }
  next();
};
