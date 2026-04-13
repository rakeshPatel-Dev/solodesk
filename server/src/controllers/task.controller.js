// controllers/task.controller.js
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import mongoose from "mongoose";
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

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { projectId, title, description, status, priority } = req.body;

    // Validate ObjectId for projectId
    if (!validateObjectIdOrRespond(res, projectId, "Project")) return;

    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    }).populate("clientId", "name email company");

    if (!project) {
      return sendNotFoundError(res, "Project not found or you don't have permission");
    }

    // Validate title
    if (!title || title.trim().length === 0) {
      return sendBadRequestError(res, "Task title is required");
    }

    // Check for duplicate task title in the same project
    const existingTask = await Task.findOne({
      projectId,
      title: title.trim(),
      userId: req.user.id,
    });

    if (existingTask) {
      return sendBadRequestError(res, "A task with this title already exists in this project");
    }

    const allowedStatuses = Task.schema.path("status").enumValues;
    const allowedPriorities = Task.schema.path("priority").enumValues;

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return sendBadRequestError(res, "Invalid status");
    }

    if (priority !== undefined && !allowedPriorities.includes(priority)) {
      return sendBadRequestError(res, "Invalid priority");
    }

    // Create task
    const task = await Task.create({
      projectId,
      title: title.trim(),
      description: description?.trim(),
      status: status || "Todo",
      priority: priority || "Medium",
      userId: req.user.id,
    });

    // Populate project info for response
    const populatedTask = await Task.findById(task._id)
      .populate("projectId", "name status budget clientId")
      .populate("userId", "name email");

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    sendServerError(res, "Create task error", error, "Server error while creating task");
  }
};

// @desc    Get all tasks for authenticated user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      projectId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = { userId: req.user.id };

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by priority
    if (priority && priority !== "all") {
      query.priority = priority;
    }

    // Filter by project
    if (projectId) {
      if (!validateObjectIdOrRespond(res, projectId, "Project")) return;
      query.projectId = projectId;
    }

    // Search functionality - escape user input to prevent regex ReDoS attack
    if (search) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    // Allowed sort fields
    const allowedSortFields = ["createdAt", "updatedAt", "title", "priority", "status"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[safeSortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute queries
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("projectId", "name status budget clientId")
        .populate("userId", "name email"),
      Task.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    sendServerError(res, "Get tasks error", error, "Server error while fetching tasks");
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!validateObjectIdOrRespond(res, id, "Task")) return;

    const task = await Task.findOne({
      _id: id,
      userId: req.user.id,
    })
      .populate("projectId", "name status budget description clientId")
      .populate("userId", "name email");

    if (!task) {
      return sendNotFoundError(res, "Task not found");
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    sendServerError(res, "Get task by ID error", error, "Server error while fetching task");
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, projectId } = req.body;

    // Validate ObjectId
    if (!validateObjectIdOrRespond(res, id, "Task")) return;

    // Check if task exists and belongs to user
    const task = await Task.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!task) {
      return sendNotFoundError(res, "Task not found");
    }

    // If projectId is being updated, verify new project exists and belongs to user
    if (projectId && projectId !== task.projectId.toString()) {
      if (!validateObjectIdOrRespond(res, projectId, "Project")) return;

      const project = await Project.findOne({
        _id: projectId,
        userId: req.user.id,
      });

      if (!project) {
        return sendNotFoundError(res, "Project not found or you don't have permission");
      }
    }

    // Check for duplicate title (excluding current task)
    if (title && title.trim() !== task.title) {
      const titleExists = await Task.findOne({
        projectId: projectId || task.projectId,
        title: title.trim(),
        userId: req.user.id,
        _id: { $ne: id },
      });
      if (titleExists) {
        return sendBadRequestError(res, "Another task with this title already exists in this project");
      }
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title: title !== undefined ? title.trim() : task.title,
        description: description !== undefined ? description.trim() : task.description,
        status: status || task.status,
        priority: priority || task.priority,
        projectId: projectId || task.projectId,
      },
      { new: true, runValidators: true }
    )
      .populate("projectId", "name status budget")
      .populate("userId", "name email");

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    sendServerError(res, "Update task error", error, "Server error while updating task");
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!validateObjectIdOrRespond(res, id, "Task")) return;

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!task) {
      return sendNotFoundError(res, "Task not found");
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: { id: task._id },
    });
  } catch (error) {
    sendServerError(res, "Delete task error", error, "Server error while deleting task");
  }
};

// @desc    Get task statistics for dashboard
// @route   GET /api/tasks/stats
// @access  Private
export const getTaskStats = async (req, res) => {
  try {
    // Convert userId to ObjectId for aggregation pipeline type safety
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const [
      totalTasks,
      todoTasks,
      doingTasks,
      doneTasks,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      recentTasks,
      projectStats,
    ] = await Promise.all([
      Task.countDocuments({ userId: req.user.id }),
      Task.countDocuments({ userId: req.user.id, status: "Todo" }),
      Task.countDocuments({ userId: req.user.id, status: "Doing" }),
      Task.countDocuments({ userId: req.user.id, status: "Done" }),
      Task.countDocuments({ userId: req.user.id, priority: "High" }),
      Task.countDocuments({ userId: req.user.id, priority: "Medium" }),
      Task.countDocuments({ userId: req.user.id, priority: "Low" }),
      Task.find({ userId: req.user.id })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("projectId", "name")
        .select("title status priority projectId updatedAt"),
      Task.aggregate([
        // Explicit ObjectId conversion ensures aggregation pipeline type matching
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: "$projectId",
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ["$status", "Doing"] }, 1, 0] },
            },
            todo: {
              $sum: { $cond: [{ $eq: ["$status", "Todo"] }, 1, 0] },
            },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "projects",
            localField: "_id",
            foreignField: "_id",
            as: "project",
          },
        },
        { $unwind: "$project" },
        {
          $project: {
            projectName: "$project.name",
            total: 1,
            completed: 1,
            inProgress: 1,
            todo: 1,
            completionRate: {
              $multiply: [
                { $divide: ["$completed", { $max: ["$total", 1] }] },
                100,
              ],
            },
          },
        },
      ]),
    ]);

    const completionRate = totalTasks > 0
      ? ((doneTasks / totalTasks) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalTasks,
          todo: todoTasks,
          doing: doingTasks,
          done: doneTasks,
          completionRate: parseFloat(completionRate),
        },
        byPriority: {
          high: highPriorityTasks,
          medium: mediumPriorityTasks,
          low: lowPriorityTasks,
        },
        recentTasks,
        topProjects: projectStats,
      },
    });
  } catch (error) {
    sendServerError(res, "Get task stats error", error, "Server error while fetching task statistics");
  }
};

// @desc    Bulk delete tasks
// @route   DELETE /api/tasks/bulk
// @access  Private
export const bulkDeleteTasks = async (req, res) => {
  try {
    const { taskIds } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return sendBadRequestError(res, "Please provide an array of task IDs");
    }

    // Validate all IDs
    if (!validateObjectIdArrayOrRespond(res, taskIds, "Task")) return;

    const result = await Task.deleteMany({
      _id: { $in: taskIds },
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} task(s) deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    sendServerError(res, "Bulk delete tasks error", error, "Server error while bulk deleting tasks");
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["Todo", "Doing", "Done"].includes(status)) {
      return sendBadRequestError(res, "Status must be either 'Todo', 'Doing', or 'Done'");
    }

    // Validate ObjectId
    if (!validateObjectIdOrRespond(res, id, "Task")) return;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { status },
      { new: true, runValidators: true }
    )
      .populate("projectId", "name")
      .populate("userId", "name email");

    if (!task) {
      return sendNotFoundError(res, "Task not found");
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    sendServerError(res, "Update task status error", error, "Server error while updating task status");
  }
};

// @desc    Update task priority
// @route   PATCH /api/tasks/:id/priority
// @access  Private
export const updateTaskPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!priority || !["Low", "Medium", "High"].includes(priority)) {
      return sendBadRequestError(res, "Priority must be either 'Low', 'Medium', or 'High'");
    }

    // Validate ObjectId
    if (!validateObjectIdOrRespond(res, id, "Task")) return;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { priority },
      { new: true, runValidators: true }
    )
      .populate("projectId", "name")
      .populate("userId", "name email");

    if (!task) {
      return sendNotFoundError(res, "Task not found");
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    sendServerError(res, "Update task priority error", error, "Server error while updating task priority");
  }
};

// @desc    Get tasks by project
// @route   GET /api/tasks/project/:projectId
// @access  Private
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    // Validate ObjectId
    if (!validateObjectIdOrRespond(res, projectId, "Project")) return;

    // Check if project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    }).populate("clientId", "name email company");

    if (!project) {
      return sendNotFoundError(res, "Project not found");
    }

    // Build query
    const query = {
      projectId: new mongoose.Types.ObjectId(projectId),
      userId: new mongoose.Types.ObjectId(req.user.id),
    };
    if (status && status !== "all") {
      query.status = status;
    }

    const tasksWithPriorityOrder = await Task.aggregate([
      { $match: query },
      {
        $addFields: {
          priorityOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "High"] }, then: 3 },
                { case: { $eq: ["$priority", "Medium"] }, then: 2 },
                { case: { $eq: ["$priority", "Low"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { priorityOrder: -1, createdAt: 1 } },
      {
        $project: {
          title: 1,
          description: 1,
          status: 1,
          priority: 1,
          createdAt: 1,
          updatedAt: 1,
          projectId: 1,
        },
      },
    ]);

    const tasks = await Task.populate(tasksWithPriorityOrder, {
      path: "projectId",
      select: "name status",
    });

    // Group tasks by status for Kanban view
    const kanbanData = {
      todo: tasks.filter(task => task.status === "Todo"),
      doing: tasks.filter(task => task.status === "Doing"),
      done: tasks.filter(task => task.status === "Done"),
    };

    res.status(200).json({
      success: true,
      data: {
        project,
        tasks,
        kanban: kanbanData,
        summary: {
          total: tasks.length,
          todo: kanbanData.todo.length,
          doing: kanbanData.doing.length,
          done: kanbanData.done.length,
        },
      },
    });
  } catch (error) {
    sendServerError(res, "Get tasks by project error", error, "Server error while fetching tasks for project");
  }
};

// @desc    Bulk update task status
// @route   PATCH /api/tasks/bulk/status
// @access  Private
export const bulkUpdateTaskStatus = async (req, res) => {
  try {
    const { taskIds, status } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return sendBadRequestError(res, "Please provide an array of task IDs");
    }

    if (!status || !["Todo", "Doing", "Done"].includes(status)) {
      return sendBadRequestError(res, "Status must be either 'Todo', 'Doing', or 'Done'");
    }

    // Validate all IDs
    if (!validateObjectIdArrayOrRespond(res, taskIds, "Task")) return;

    const result = await Task.updateMany(
      { _id: { $in: taskIds }, userId: req.user.id },
      { status }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} task(s) updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    sendServerError(res, "Bulk update task status error", error, "Server error while bulk updating task status");
  }
};

// @desc    Search tasks
// @route   GET /api/tasks/search
// @access  Private
export const searchTasks = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return sendBadRequestError(res, "Search query must be at least 2 characters");
    }

    // Escape user input to prevent regex ReDoS attack
    const escapedSearch = escapeRegex(q);
    const searchRegex = new RegExp(escapedSearch, "i");
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const tasks = await Task.find({
      userId: req.user.id,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
      ],
    })
      .limit(limitNum)
      .populate("projectId", "name")
      .select("title description status priority projectId")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    sendServerError(res, "Search tasks error", error, "Server error while searching tasks");
  }
};