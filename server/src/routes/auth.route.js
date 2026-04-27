import express from "express";
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  updateAvatar,
  logout,
  deactivateAccount,
  deleteAccount,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);
router.post("/logout", authenticateUser, logout);

router.put("/change-password", authenticateUser, changePassword);
router.put("/update-profile", authenticateUser, updateProfile);
router.patch("/avatar", authenticateUser, updateAvatar);
router.put("/deactivate-account", authenticateUser, deactivateAccount);
router.delete("/delete-account", authenticateUser, deleteAccount);

router.get("/me", authenticateUser, getMe);

export default router;
