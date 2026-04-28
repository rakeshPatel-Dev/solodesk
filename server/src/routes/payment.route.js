// routes/payment.routes.js
import express from "express";
import { authenticateUser as protect } from "../middlewares/auth.middleware.js";
import {
  addPaymentTransaction,
  updatePaymentTransaction,
  deletePaymentTransaction,
} from "../controllers/payment.controller.js";

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Stats and special routes (must be before /:id routes)
// router.get("/stats", getPaymentStats);
// router.get("/overdue", getOverduePayments);

// Bulk operations
// router.delete("/bulk", bulkDeletePayments);

// Get payment by project
// router.get("/project/:projectId", getPaymentByProject);

// Add payment to existing record
// router.post("/:id/add-payment", addPayment);

// Standard CRUD routes
// router.post("/", createPayment);
// router.get("/", getPayments);
// router.get("/:id", getPaymentById);
// router.put("/:id", updatePayment);
// router.delete("/:id", deletePayment);

// Payment transactions
router.post("/project/:projectId/transactions", addPaymentTransaction);
router.put("/project/:projectId/transactions/:transactionId", updatePaymentTransaction);
router.delete("/project/:projectId/transactions/:transactionId", deletePaymentTransaction);

export default router;