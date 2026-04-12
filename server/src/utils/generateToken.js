// Generate JWT Token


import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Generate Reset Password Token
export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  return { resetToken, resetPasswordToken, resetPasswordExpiry };
};