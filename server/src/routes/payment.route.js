// routes/payment.routes.js
import express from "express";
import { authenticateUser as protect } from "../middlewares/auth.middleware.js";
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentStats,
  getPaymentByProject,
  addPayment,
  bulkDeletePayments,
  getOverduePayments,
} from "../controllers/payment.controller.js";

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Stats and special routes (must be before /:id routes)
router.get("/stats", getPaymentStats);
router.get("/overdue", getOverduePayments);

// Bulk operations
router.delete("/bulk", bulkDeletePayments);

// Get payment by project
router.get("/project/:projectId", getPaymentByProject);

// Add payment to existing record
router.post("/:id/add-payment", addPayment);

// Standard CRUD routes
router.post("/", createPayment);
router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;