// controllers/project.controller.js
import mongoose from "mongoose";
import Project from "../models/project.model.js";
import Client from "../models/client.model.js";
import {
  sendBadRequestError,
  sendNotFoundError,
  sendServerError,
} from "../utils/sendError.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import {
  validateObjectIdOrRespond,
  validateObjectIdArrayOrRespond,
} from "../validators/objectIdValidator.js";

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      clientId,
      type,
      budget,
      status,
      startDate,
      deadline,
    } = req.body;

    // Validate ObjectId for clientId
    if (!validateObjectIdOrRespond(res, clientId, "client ID")) return;

    // Check if client exists and belongs to user
    const client = await Client.findOne({
      _id: clientId,
      userId: req.user.id,
    });

    if (!client) {
      return sendNotFoundError(res, "Client not found or you don't have permission");
    }

    // Check if project with same name exists for this client
    const existingProject = await Project.findOne({
      name,
      clientId,
      userId: req.user.id,
    });

    if (existingProject) {
      return sendBadRequestError(res, "A project with this name already exists for this client");
    }

    // Validate dates
    if (startDate && deadline && new Date(startDate) > new Date(deadline)) {
      return sendBadRequestError(res, "Start date cannot be after deadline");
    }

    // Create project
    const project = await Project.create({
      name,
      description,
      clientId,
      userId: req.user.id,
      type,
      budget: budget || 0,
      status: status || "Lead",
      startDate,
      deadline,
    });

    // Populate client info for response
    const populatedProject = await Project.findById(project._id).populate(
      "clientId",
      "name email company phone"
    );

    res.status(201).json({
      success: true,
      data: populatedProject,
    });
  } catch (error) {
    return sendServerError(res, "Create project error", error, "Server error while creating project");
  }
};

// @desc    Get all projects for authenticated user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      clientId,
      type,
      sortBy = "createdAt",
      sortOrder = "desc",
      minBudget,
      maxBudget,
      startDateFrom,
      startDateTo,
      deadlineFrom,
      deadlineTo,
    } = req.query;

    // Build query
    const query = { userId: req.user.id };

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by client
    if (clientId) {
      if (!validateObjectIdOrRespond(res, clientId, "client ID")) return;
      query.clientId = clientId;
    }

    // Filter by type
    if (type) {
      query.type = { $regex: escapeRegex(type), $options: "i" };
    }

    // Filter by budget range
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = parseFloat(minBudget);
      if (maxBudget) query.budget.$lte = parseFloat(maxBudget);
    }

    // Filter by start date range
    if (startDateFrom || startDateTo) {
      query.startDate = {};
      if (startDateFrom) query.startDate.$gte = new Date(startDateFrom);
      if (startDateTo) query.startDate.$lte = new Date(startDateTo);
    }

    // Filter by deadline range
    if (deadlineFrom || deadlineTo) {
      query.deadline = {};
      if (deadlineFrom) query.deadline.$gte = new Date(deadlineFrom);
      if (deadlineTo) query.deadline.$lte = new Date(deadlineTo);
    }

    // Search functionality
    if (search) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { type: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute queries
    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("clientId", "name email company phone status")
        .populate("userId", "name email"),
      Project.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return sendServerError(res, "Get projects error", error, "Server error while fetching projects");
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!validateObjectIdOrRespond(res, id, "project ID")) return;

    const project = await Project.findOne({
      _id: id,
      userId: req.user.id,
    })
      .populate("clientId", "name email company phone address status")
      .populate("userId", "name email");

    if (!project) {
      return sendNotFoundError(res, "Project not found");
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    return sendServerError(res, "Get project by ID error", error, "Server error while fetching project");
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      clientId,
      type,
      budget,
      status,
      startDate,
      deadline,
    } = req.body;

    // Validate ObjectId
    if (!validateObjectIdOrRespond(res, id, "project ID")) return;

    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!project) {
      return sendNotFoundError(res, "Project not found");
    }

    // If clientId is being updated, verify new client exists and belongs to user
    if (clientId && clientId !== project.clientId.toString()) {
      if (!validateObjectIdOrRespond(res, clientId, "client ID")) return;

      const client = await Client.findOne({
        _id: clientId,
        userId: req.user.id,
      });

      if (!client) {
        return sendNotFoundError(res, "Client not found or you don't have permission");
      }
    }

    // Check for duplicate name (excluding current project)
    if (name && name !== project.name) {
      const nameExists = await Project.findOne({
        name,
        clientId: clientId || project.clientId,
        userId: req.user.id,
        _id: { $ne: id },
      });
      if (nameExists) {
        return sendBadRequestError(res, "Another project with this name already exists for this client");
      }
    }

    // Validate dates
    const newStartDate = startDate !== undefined ? startDate : project.startDate;
    const newDeadline = deadline !== undefined ? deadline : project.deadline;

    if (newStartDate && newDeadline && new Date(newStartDate) > new Date(newDeadline)) {
      return sendBadRequestError(res, "Start date cannot be after deadline");
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        name: name || project.name,
        description: description !== undefined ? description : project.description,
        clientId: clientId || project.clientId,
        type: type !== undefined ? type : project.type,
        budget: budget !== undefined ? budget : project.budget,
        status: status || project.status,
        startDate: newStartDate,
        deadline: newDeadline,
      },
      { new: true, runValidators: true }
    ).populate("clientId", "name email company phone");

    res.status(200).json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    return sendServerError(res, "Update project error", error, "Server error while updating project");
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!validateObjectIdOrRespond(res, id, "project ID")) return;

    const project = await Project.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!project) {
      return sendNotFoundError(res, "Project not found");
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: { id: project._id },
    });
  } catch (error) {
    return sendServerError(res, "Delete project error", error, "Server error while deleting project");
  }
};

// @desc    Get project statistics for dashboard
// @route   GET /api/projects/stats
// @access  Private
export const getProjectStats = async (req, res) => {
  try {
    const [
      totalProjects,
      leadProjects,
      inProgressProjects,
      completedProjects,
      totalBudget,
      recentProjects,
      projectsByClient,
    ] = await Promise.all([
      Project.countDocuments({ userId: req.user.id }),
      Project.countDocuments({ userId: req.user.id, status: "Lead" }),
      Project.countDocuments({ userId: req.user.id, status: "In Progress" }),
      Project.countDocuments({ userId: req.user.id, status: "Completed" }),
      Project.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
        { $group: { _id: null, total: { $sum: "$budget" } } },
      ]),
      Project.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("clientId", "name")
        .select("name status budget clientId createdAt"),
      Project.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
        {
          $group: {
            _id: "$clientId",
            count: { $sum: 1 },
            totalBudget: { $sum: "$budget" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "clients",
            localField: "_id",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: "$client" },
        {
          $project: {
            clientName: "$client.name",
            count: 1,
            totalBudget: 1,
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalProjects,
        byStatus: {
          lead: leadProjects,
          inProgress: inProgressProjects,
          completed: completedProjects,
        },
        totalBudget: totalBudget[0]?.total || 0,
        recentProjects,
        topClients: projectsByClient,
      },
    });
  } catch (error) {
    return sendServerError(res, "Get project stats error", error, "Server error while fetching statistics");
  }
};

// @desc    Bulk delete projects
// @route   DELETE /api/projects/bulk
// @access  Private
export const bulkDeleteProjects = async (req, res) => {
  try {
    const { projectIds } = req.body;

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return sendBadRequestError(res, "Please provide an array of project IDs");
    }

    if (!validateObjectIdArrayOrRespond(res, projectIds, "project IDs")) return;

    const result = await Project.deleteMany({
      _id: { $in: projectIds },
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} project(s) deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    return sendServerError(res, "Bulk delete projects error", error, "Server error while bulk deleting projects");
  }
};

// @desc    Update project status
// @route   PATCH /api/projects/:id/status
// @access  Private
export const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["Lead", "In Progress", "Completed"].includes(status)) {
      return sendBadRequestError(res, "Status must be either 'Lead', 'In Progress', or 'Completed'");
    }

    // Validate ObjectId
    if (!validateObjectIdOrRespond(res, id, "project ID")) return;

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { status },
      { new: true, runValidators: true }
    ).populate("clientId", "name");

    if (!project) {
      return sendNotFoundError(res, "Project not found");
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    return sendServerError(res, "Update project status error", error, "Server error while updating project status");
  }
};

// @desc    Get projects by client
// @route   GET /api/projects/client/:clientId
// @access  Private
export const getProjectsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Validate ObjectId
    if (!validateObjectIdOrRespond(res, clientId, "client ID")) return;

    // Check if client belongs to user
    const client = await Client.findOne({
      _id: clientId,
      userId: req.user.id,
    });

    if (!client) {
      return sendNotFoundError(res, "Client not found");
    }

    const projects = await Project.find({
      clientId,
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .select("name status budget startDate deadline type");

    res.status(200).json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    return sendServerError(res, "Get projects by client error", error, "Server error while fetching client projects");
  }
};

// @desc    Search projects
// @route   GET /api/projects/search
// @access  Private
export const searchProjects = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return sendBadRequestError(res, "Search query must be at least 2 characters");
    }

    const searchRegex = new RegExp(escapeRegex(q), "i");
    const limitNum = parseInt(limit, 10);

    const projects = await Project.find({
      userId: req.user.id,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { type: searchRegex },
      ],
    })
      .limit(limitNum)
      .populate("clientId", "name email company")
      .select("name status budget clientId type")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    return sendServerError(res, "Search projects error", error, "Server error while searching projects");
  }
};

// @desc    Get upcoming deadlines
// @route   GET /api/projects/deadlines/upcoming
// @access  Private
export const getUpcomingDeadlines = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days, 10);

    if (!Number.isFinite(daysNum) || !Number.isInteger(daysNum) || daysNum < 0) {
      return sendBadRequestError(res, "Days must be a non-negative integer");
    }

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysNum);

    const projects = await Project.find({
      userId: req.user.id,
      deadline: { $gte: today, $lte: futureDate },
      status: { $ne: "Completed" },
    })
      .sort({ deadline: 1 })
      .populate("clientId", "name email company")
      .select("name deadline status budget clientId");

    res.status(200).json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    return sendServerError(res, "Get upcoming deadlines error", error, "Server error while fetching deadlines");
  }
};