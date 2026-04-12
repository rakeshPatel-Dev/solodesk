import express from "express";
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  deactivateAccount,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateUser, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);
router.put("/change-password", authenticateUser, changePassword);
router.post("/logout", authenticateUser, logout);
router.put("/deactivate-account", authenticateUser, deactivateAccount);

export default router;
