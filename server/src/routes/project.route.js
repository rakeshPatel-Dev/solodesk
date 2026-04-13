// routes/project.routes.js
import express from "express";
import { authenticateUser as protect } from "../middleware/auth.middleware.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
  bulkDeleteProjects,
  updateProjectStatus,
  getProjectsByClient,
  searchProjects,
  getUpcomingDeadlines,
} from "../controllers/project.controller.js";

const router = express.Router();

// All project routes require authentication
router.use(protect);

// Stats and special routes (must be before /:id routes)
router.get("/stats", getProjectStats);
router.get("/search", searchProjects);
router.get("/deadlines/upcoming", getUpcomingDeadlines);

// Bulk operations
router.delete("/bulk", bulkDeleteProjects);

// Get projects by client
router.get("/client/:clientId", getProjectsByClient);

// Standard CRUD routes
router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Status update
router.patch("/:id/status", updateProjectStatus);

export default router;