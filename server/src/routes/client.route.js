// routes/client.routes.js
import express from "express";
import { authenticateUser as protect } from "../middlewares/auth.middleware.js";
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientStats,
  bulkDeleteClients,
  updateClientStatus,
  searchClients,
} from "../controllers/client.controller.js";

const router = express.Router();

// All client routes require authentication
router.use(protect);

// Stats and search routes (must be before /:id routes)
router.get("/stats", getClientStats);
router.get("/search", searchClients);

// Bulk operations
router.delete("/bulk", bulkDeleteClients);

// Standard CRUD routes
router.post("/", createClient);
router.get("/", getClients);
router.get("/:id", getClientById);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

// Status update
router.patch("/:id/status", updateClientStatus);

export default router;