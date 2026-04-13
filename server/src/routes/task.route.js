// routes/task.route.js
import express from "express";
import { authenticateUser as protect } from "../middlewares/auth.middleware.js";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  bulkDeleteTasks,
  updateTaskStatus,
  updateTaskPriority,
  getTasksByProject,
  bulkUpdateTaskStatus,
  searchTasks,
} from "../controllers/task.controller.js";

const router = express.Router();

// All task routes require authentication
router.use(protect);

// Stats and special routes (must be before /:id routes)
router.get("/stats", getTaskStats);
router.get("/search", searchTasks);

// Bulk operations
router.post("/bulk/delete", bulkDeleteTasks);
router.patch("/bulk/status", bulkUpdateTaskStatus);

// Get tasks by project
router.get("/project/:projectId", getTasksByProject);

// Status and priority updates
router.patch("/:id/status", updateTaskStatus);
router.patch("/:id/priority", updateTaskPriority);

// Standard CRUD routes
router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;