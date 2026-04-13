// controllers/client.controller.js
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

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private
export const createClient = async (req, res) => {
  try {
    const { name, address, email, phone, notes, status } = req.body;

    const existingClient = await Client.findOne({
      name,
      userId: req.user.id,
    });

    if (existingClient) {
      return sendBadRequestError(res, "You already have a client with this name");
    }

    if (email) {
      const emailExists = await Client.findOne({
        email,
        userId: req.user.id,
      });
      if (emailExists) {
        return sendBadRequestError(res, "A client with this email already exists");
      }
    }

    const client = await Client.create({
      name,
      userId: req.user.id,
      address,
      email,
      phone,
      notes,
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    return sendServerError(res, "Create client error", error, "Server error while creating client");
  }
};

// @desc    Get all clients for authenticated user
// @route   GET /api/clients
// @access  Private
export const getClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { userId: req.user.id };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      // Escape search input once and reuse so every field follows identical matching rules.
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
        { phone: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 50);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [clients, total] = await Promise.all([
      Client.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("userId", "name email"),
      Client.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: clients,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return sendServerError(res, "Get clients error", error, "Server error while fetching clients");
  }
};

// @desc    Get single client by ID
// @route   GET /api/clients/:id
// @access  Private
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectIdOrRespond(res, id, "client ID")) return;

    const client = await Client.findOne({
      _id: id,
      userId: req.user.id,
    }).populate("userId", "name email");

    if (!client) {
      return sendNotFoundError(res, "Client not found");
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    return sendServerError(res, "Get client error", error, "Server error while fetching client");
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, email, phone, notes, status } = req.body;

    if (!validateObjectIdOrRespond(res, id, "client ID")) return;

    const client = await Client.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!client) {
      return sendNotFoundError(res, "Client not found");
    }

    if (name && name !== client.name) {
      const nameExists = await Client.findOne({
        name,
        userId: req.user.id,
        _id: { $ne: id },
      });
      if (nameExists) {
        return sendBadRequestError(res, "Another client with this name already exists");
      }
    }

    if (email && email !== client.email) {
      const emailExists = await Client.findOne({
        email,
        userId: req.user.id,
        _id: { $ne: id },
      });
      if (emailExists) {
        return sendBadRequestError(res, "Another client with this email already exists");
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        name: name || client.name,
        address: address !== undefined ? address : client.address,
        email: email !== undefined ? email : client.email,
        phone: phone !== undefined ? phone : client.phone,
        notes: notes !== undefined ? notes : client.notes,
        status: status || client.status,
      },
      { returnDocument: "after", runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedClient,
    });
  } catch (error) {
    return sendServerError(res, "Update client error", error, "Server error while updating client");
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectIdOrRespond(res, id, "client ID")) return;

    const client = await Client.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!client) {
      return sendNotFoundError(res, "Client not found");
    }

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
      data: { id: client._id },
    });
  } catch (error) {
    return sendServerError(res, "Delete client error", error, "Server error while deleting client");
  }
};

// @desc    Get client statistics for dashboard
// @route   GET /api/clients/stats
// @access  Private
export const getClientStats = async (req, res) => {
  try {
    const [totalClients, activeClients, inactiveClients, recentClients] =
      await Promise.all([
        Client.countDocuments({ userId: req.user.id }),
        Client.countDocuments({ userId: req.user.id, status: "Active" }),
        Client.countDocuments({ userId: req.user.id, status: "Inactive" }),
        Client.find({ userId: req.user.id })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("name email status createdAt"),
      ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalClients,
        active: activeClients,
        inactive: inactiveClients,
        recent: recentClients,
      },
    });
  } catch (error) {
    return sendServerError(res, "Get client stats error", error, "Server error while getting client stats");
  }
};

// @desc    Bulk delete clients
// @route   DELETE /api/clients/bulk
// @access  Private
export const bulkDeleteClients = async (req, res) => {
  try {
    const { clientIds } = req.body;

    if (!validateObjectIdArrayOrRespond(res, clientIds, "client IDs")) return;

    const result = await Client.deleteMany({
      _id: { $in: clientIds },
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} client(s) deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    return sendServerError(res, "Bulk delete clients error", error, "Server error while bulk deleting clients");
  }
};

// @desc    Update client status (Active/Inactive)
// @route   PATCH /api/clients/:id/status
// @access  Private
export const updateClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["Active", "Inactive"].includes(status)) {
      return sendBadRequestError(res, "Status must be either 'Active' or 'Inactive'");
    }

    if (!validateObjectIdOrRespond(res, id, "client ID")) return;

    const client = await Client.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { status },
      { returnDocument: "after", runValidators: true }
    );

    if (!client) {
      return sendNotFoundError(res, "Client not found");
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    return sendServerError(res, "Update client status error", error, "Server error while updating client status");
  }
};

// @desc    Search clients
// @route   GET /api/clients/search
// @access  Private
export const searchClients = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return sendBadRequestError(res, "Search query must be at least 2 characters");
    }

    // Search is intentionally partial/case-insensitive while still treating input as literal text.
    const searchRegex = new RegExp(escapeRegex(q), "i");
    const limitNum = parseInt(limit, 10);

    const clients = await Client.find({
      userId: req.user.id,
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ],
    })
      .limit(limitNum)
      .select("name email phone status")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: clients,
      count: clients.length,
    });
  } catch (error) {
    return sendServerError(res, "Search clients error", error, "Server error while searching clients");
  }
};