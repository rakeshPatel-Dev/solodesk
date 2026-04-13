// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {
  sendUnauthorizedError,
  sendForbiddenError,
  sendServerError,
} from "../utils/sendError.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return sendUnauthorizedError(res, "Authentication required. Please log in.");
    }

    if (!process.env.JWT_SECRET) {
      return sendServerError(res, "Auth middleware config error", new Error("Missing JWT_SECRET"), "Server auth configuration error.");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify User still exists and is active
    const user = await User.findById(decoded.id).select("_id name email role isActive");
    if (!user) {
      return sendUnauthorizedError(res, "User no longer exists.");
    }

    if (!user.isActive) {
      return sendForbiddenError(res, "Account is deactivated. Please contact support.");
    }

    // Attach only safe fields used by downstream handlers
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return sendUnauthorizedError(res, "Invalid token. Please log in again.");
    }

    if (error.name === "TokenExpiredError") {
      return sendUnauthorizedError(res, "Token expired. Please log in again.");
    }

    return sendServerError(res, "Auth middleware error", error, "Authentication failed.");
  }
};