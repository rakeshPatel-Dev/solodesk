// controllers/auth.controller.js
import User from "../models/user.model.js";
import Client from "../models/client.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import Payment from "../models/payment.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken, generateResetToken } from "../utils/generateToken.js";
import { validatePasswordStrength } from "../validators/passwordValidator.js";
import { isValidEmail } from "../validators/emailValidator.js";
import { setAuthCookie } from "../utils/setCookie.js";
import {
  sendBadRequestError,
  sendUnauthorizedError,
  sendForbiddenError,
  sendNotFoundError,
  sendConflictError,
  sendServerError,
} from "../utils/sendError.js";


const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";

const normalizeProfileImage = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, avatar } = req.body;

    // Input validation
    if (!name || !name.trim()) {
      return sendBadRequestError(res, "Name is required");
    }

    if (!email || !isValidEmail(email)) {
      return sendBadRequestError(res, "Valid email is required");
    }

    if (!password) {
      return sendBadRequestError(res, "Password is required");
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return sendBadRequestError(res, passwordValidation.message);
    }

    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return sendConflictError(res, "User already exists with this email");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "user",
      avatar: avatar || null,
    });

    // Generate token
    const token = generateToken(user._id, user.role);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return sendServerError(res, "Register error", error, "Server error during registration");
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !isValidEmail(email)) {
      return sendBadRequestError(res, "Valid email is required");
    }

    if (!password) {
      return sendBadRequestError(res, "Password is required");
    }

    // Check if user exists and include password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return sendUnauthorizedError(res, "Invalid credentials");
    }

    // Check if account is active
    if (!user.isActive) {
      return sendForbiddenError(res, "Account is deactivated. Please contact support.");
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return sendUnauthorizedError(res, "Invalid credentials");
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id, user.role);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    return sendServerError(res, "Login error", error, "Server error during login");
  }
};



// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-resetPasswordToken -resetPasswordExpiry");

    if (!user) {
      return sendNotFoundError(res, "User not found");
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return sendServerError(res, "Get me error", error, "Server error");
  }
};

// @desc    Forgot password - send reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return sendBadRequestError(res, "Valid email is required");
    }

    const normalizedEmail = email?.toLowerCase()?.trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists for this email, a reset link will be sent.",
      });
    }

    // Generate reset token
    const { resetToken, resetPasswordToken, resetPasswordExpiry } = generateResetToken();

    // Save to database
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiry = resetPasswordExpiry;
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    // In production: Send email with resetURL instead of returning token
    if (process.env.NODE_ENV !== "production") {
      const resetURL = `${FRONTEND_URL}/reset-password/${resetToken}`;
      return res.status(200).json({
        success: true,
        message: "Password reset token sent to email",
        resetToken, // Dev only
        resetURL,
      });
    }

    // Production: Don't expose the token in response
    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    return sendServerError(res, "Forgot password error", error, "Server error");
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    // Input validation
    if (!password) {
      return sendBadRequestError(res, "Password is required");
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return sendBadRequestError(res, passwordValidation.message);
    }

    // Hash the received token to compare with stored hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiry: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return sendBadRequestError(res, "Invalid or expired reset token");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    return sendServerError(res, "Reset password error", error, "Server error");
  }
};

// @desc    Change password (authenticated user)
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Input validation
    if (!currentPassword) {
      return sendBadRequestError(res, "Current password is required");
    }

    if (!newPassword) {
      return sendBadRequestError(res, "New password is required");
    }

    if (currentPassword === newPassword) {
      return sendBadRequestError(res, "New password must be different from current password");
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return sendBadRequestError(res, passwordValidation.message);
    }

    // Get user with password field
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return sendNotFoundError(res, "User not found");
    }

    // Check current password
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return sendUnauthorizedError(res, "Current password is incorrect");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return sendServerError(res, "Change password error", error, "Server error");
  }
};

// @desc    Update authenticated user profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar, image } = req.body;
    const nextImage = normalizeProfileImage(
      Object.prototype.hasOwnProperty.call(req.body, "image") ? image : avatar
    );

    const user = await User.findById(req.user.id);

    if (!user) {
      return sendNotFoundError(res, "User not found");
    }

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return sendBadRequestError(res, "Name cannot be empty");
      }

      user.name = name.trim();
    }

    if (email !== undefined) {
      if (!email || !isValidEmail(email)) {
        return sendBadRequestError(res, "Valid email is required");
      }

      const normalizedEmail = email.toLowerCase().trim();
      const emailExists = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (emailExists) {
        return sendConflictError(res, "User already exists with this email");
      }

      user.email = normalizedEmail;
    }

    if (nextImage !== undefined) {
      if (typeof nextImage !== "string" && nextImage !== null) {
        return sendBadRequestError(res, "Avatar image must be a string or null");
      }

      user.avatar = nextImage;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatar: user.avatar,
        image: user.avatar,
        lastLogin: user.lastLogin,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return sendServerError(res, "Update profile error", error, "Server error while updating profile");
  }
};

// @desc    Update authenticated user avatar only
// @route   PATCH /api/auth/avatar
// @access  Private
export const updateAvatar = async (req, res) => {
  try {
    const { avatar, image } = req.body;
    const nextAvatar = normalizeProfileImage(
      Object.prototype.hasOwnProperty.call(req.body, "avatar") ? avatar : image
    );

    if (nextAvatar === undefined) {
      return sendBadRequestError(res, "Avatar is required");
    }

    if (typeof nextAvatar !== "string" && nextAvatar !== null) {
      return sendBadRequestError(res, "Avatar image must be a string or null");
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return sendNotFoundError(res, "User not found");
    }

    user.avatar = nextAvatar;
    await user.save();

    return res.status(200).json({
      success: true,
      message: nextAvatar ? "Avatar updated successfully" : "Avatar removed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatar: user.avatar,
        image: user.avatar,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return sendServerError(res, "Update avatar error", error, "Server error while updating avatar");
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return sendServerError(res, "Logout error", error, "Server error");
  }
};

// @desc   deactivate account (authenticated user)
// @route   PUT /api/auth/deactivate-account
// @access  Private
export const deactivateAccount = async (req, res) => {

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendNotFoundError(res, "User not found");
    }

    // Check if account is already deactivated
    if (!user.isActive) {
      return sendBadRequestError(res, "Account is already deactivated");
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    return sendServerError(res, "Deactivate account error", error, "Server error");
  }

};

// @desc    Delete current logged in user and all related data
// @route   DELETE /api/auth/delete-account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return sendNotFoundError(res, "User not found");
    }

    const userProjects = await Project.find({ userId }).select("_id");
    const projectIds = userProjects.map((project) => project._id);

    await Promise.all([
      Client.deleteMany({ userId }),
      Project.deleteMany({ userId }),
      Task.deleteMany({
        $or: [{ userId }, { projectId: { $in: projectIds } }],
      }),
      Payment.deleteMany({
        $or: [{ userId }, { projectId: { $in: projectIds } }],
      }),
      User.deleteOne({ _id: userId }),
    ]);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Account and related data deleted successfully",
    });
  } catch (error) {
    return sendServerError(res, "Delete account error", error, "Server error");
  }
};