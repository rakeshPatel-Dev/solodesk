import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import Project from "../models/project.model.js";
import {
  sendBadRequestError,
  sendNotFoundError,
  sendConflictError,
  sendServerError,
} from "../utils/sendError.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import {
  validateObjectIdOrRespond,
  validateObjectIdArrayOrRespond,
} from "../validators/objectIdValidator.js";

const toPositiveNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
};

// @desc    Create a new payment record
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
  try {
    const { projectId, totalAmount, paidAmount = 0 } = req.body;

    if (!validateObjectIdOrRespond(res, projectId, "project ID")) return;

    const normalizedTotalAmount = toPositiveNumberOrNull(totalAmount);
    const normalizedPaidAmount = toPositiveNumberOrNull(paidAmount);

    if (normalizedTotalAmount === null) {
      return sendBadRequestError(res, "Total amount must be a non-negative number");
    }

    if (normalizedPaidAmount === null) {
      return sendBadRequestError(res, "Paid amount must be a non-negative number");
    }

    if (normalizedPaidAmount > normalizedTotalAmount) {
      return sendBadRequestError(res, "Paid amount cannot exceed total amount");
    }

    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });

    if (!project) {
      return sendNotFoundError(res, "Project not found or you don't have permission");
    }

    const payment = await Payment.create({
      projectId,
      totalAmount: normalizedTotalAmount,
      paidAmount: normalizedPaidAmount,
      userId: req.user.id,
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: "projectId",
        select: "name status budget clientId startDate deadline",
        populate: { path: "clientId", select: "name email company phone" },
      })
      .populate("userId", "name email");

    return res.status(201).json({
      success: true,
      data: populatedPayment,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return sendConflictError(res, "Payment record already exists for this project. Use update endpoint instead.");
    }

    return sendServerError(res, "Create payment error", error, "Server error while creating payment record");
  }
};

// @desc    Get all payments for authenticated user
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      projectId,
      clientId,
      minAmount,
      maxAmount,
      sortBy = "createdAt",
      sortOrder = "desc",
      fromDate,
      toDate,
      search,
    } = req.query;

    const query = { userId: req.user.id };

    if (status && status !== "all") {
      query.status = status;
    }

    if (projectId) {
      if (!validateObjectIdOrRespond(res, projectId, "project ID")) return;
      query.projectId = projectId;
    }

    if (fromDate || toDate) {
      const fromDateObj = fromDate ? new Date(fromDate) : null;
      const toDateObj = toDate ? new Date(toDate) : null;

      if (fromDateObj && Number.isNaN(fromDateObj.getTime())) {
        return sendBadRequestError(res, "fromDate must be a valid date");
      }

      if (toDateObj && Number.isNaN(toDateObj.getTime())) {
        return sendBadRequestError(res, "toDate must be a valid date");
      }

      query.createdAt = {};
      if (fromDateObj) query.createdAt.$gte = fromDateObj;
      if (toDateObj) query.createdAt.$lte = toDateObj;
    }

    const normalizedMinAmount = toPositiveNumberOrNull(minAmount);
    const normalizedMaxAmount = toPositiveNumberOrNull(maxAmount);

    if (minAmount !== undefined && normalizedMinAmount === null) {
      return sendBadRequestError(res, "minAmount must be a non-negative number");
    }

    if (maxAmount !== undefined && normalizedMaxAmount === null) {
      return sendBadRequestError(res, "maxAmount must be a non-negative number");
    }

    if (normalizedMinAmount !== null || normalizedMaxAmount !== null) {
      query.totalAmount = {};
      if (normalizedMinAmount !== null) query.totalAmount.$gte = normalizedMinAmount;
      if (normalizedMaxAmount !== null) query.totalAmount.$lte = normalizedMaxAmount;
    }

    let filteredProjectIds = null;

    if (clientId) {
      if (!validateObjectIdOrRespond(res, clientId, "client ID")) return;

      const clientProjectIds = await Project.find({
        userId: req.user.id,
        clientId,
      }).distinct("_id");

      filteredProjectIds = clientProjectIds;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

      const searchProjectIds = await Project.find({
        userId: req.user.id,
        $or: [{ name: searchRegex }, { type: searchRegex }, { description: searchRegex }],
      }).distinct("_id");

      filteredProjectIds = filteredProjectIds
        ? filteredProjectIds.filter((id) => searchProjectIds.some((searchId) => String(searchId) === String(id)))
        : searchProjectIds;
    }

    if (filteredProjectIds) {
      query.projectId = { $in: filteredProjectIds };
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: "projectId",
          select: "name status budget clientId startDate deadline",
          populate: { path: "clientId", select: "name email company phone" },
        })
        .populate("userId", "name email"),
      Payment.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return sendServerError(res, "Get payments error", error, "Server error while fetching payments");
  }
};

// @desc    Get single payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectIdOrRespond(res, id, "payment ID")) return;

    const payment = await Payment.findOne({
      _id: id,
      userId: req.user.id,
    })
      .populate({
        path: "projectId",
        select: "name status budget description clientId startDate deadline",
        populate: { path: "clientId", select: "name email company phone address" },
      })
      .populate("userId", "name email");

    if (!payment) {
      return sendNotFoundError(res, "Payment record not found");
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    return sendServerError(res, "Get payment by ID error", error, "Server error while fetching payment");
  }
};

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paidAmount, totalAmount } = req.body;

    if (!validateObjectIdOrRespond(res, id, "payment ID")) return;

    const payment = await Payment.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!payment) {
      return sendNotFoundError(res, "Payment record not found");
    }

    const updateData = {};

    if (totalAmount !== undefined) {
      const normalizedTotalAmount = toPositiveNumberOrNull(totalAmount);
      if (normalizedTotalAmount === null) {
        return sendBadRequestError(res, "Total amount must be a non-negative number");
      }
      updateData.totalAmount = normalizedTotalAmount;
    }

    if (paidAmount !== undefined) {
      const normalizedPaidAmount = toPositiveNumberOrNull(paidAmount);
      if (normalizedPaidAmount === null) {
        return sendBadRequestError(res, "Paid amount must be a non-negative number");
      }

      const targetTotalAmount = updateData.totalAmount ?? payment.totalAmount;
      if (normalizedPaidAmount > targetTotalAmount) {
        return sendBadRequestError(res, "Paid amount cannot exceed total amount");
      }

      updateData.paidAmount = normalizedPaidAmount;
    }

    payment.set(updateData);
    await payment.save();

    const updatedPayment = await Payment.findById(payment._id)
      .populate({
        path: "projectId",
        select: "name status budget clientId startDate deadline",
        populate: { path: "clientId", select: "name email company phone" },
      })
      .populate("userId", "name email");

    return res.status(200).json({
      success: true,
      data: updatedPayment,
    });
  } catch (error) {
    return sendServerError(res, "Update payment error", error, "Server error while updating payment");
  }
};

// @desc    Delete payment record
// @route   DELETE /api/payments/:id
// @access  Private
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectIdOrRespond(res, id, "payment ID")) return;

    const payment = await Payment.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!payment) {
      return sendNotFoundError(res, "Payment record not found");
    }

    return res.status(200).json({
      success: true,
      message: "Payment record deleted successfully",
      data: { id: payment._id },
    });
  } catch (error) {
    return sendServerError(res, "Delete payment error", error, "Server error while deleting payment");
  }
};

// @desc    Get payment statistics for dashboard
// @route   GET /api/payments/stats
// @access  Private
export const getPaymentStats = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const [
      totalPayments,
      paidPayments,
      partialPayments,
      unpaidPayments,
      totalRevenueAgg,
      totalDueAgg,
      recentPayments,
      monthlyStats,
    ] = await Promise.all([
      Payment.countDocuments({ userId: req.user.id }),
      Payment.countDocuments({ userId: req.user.id, status: "Paid" }),
      Payment.countDocuments({ userId: req.user.id, status: "Partial" }),
      Payment.countDocuments({ userId: req.user.id, status: "Unpaid" }),
      Payment.aggregate([
        { $match: { userId: userObjectId, status: "Paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Payment.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, total: { $sum: "$dueAmount" } } },
      ]),
      Payment.find({ userId: req.user.id })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate({
          path: "projectId",
          select: "name clientId",
          populate: { path: "clientId", select: "name company" },
        })
        .select("totalAmount paidAmount dueAmount status projectId updatedAt"),
      Payment.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalAmount: { $sum: "$totalAmount" },
            paidAmount: { $sum: "$paidAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 6 },
      ]),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const totalDue = totalDueAgg[0]?.total || 0;

    const formattedMonthlyStats = monthlyStats.map((stat) => ({
      month: `${stat._id.year}-${String(stat._id.month).padStart(2, "0")}`,
      totalAmount: stat.totalAmount,
      paidAmount: stat.paidAmount,
      dueAmount: stat.totalAmount - stat.paidAmount,
      count: stat.count,
    }));

    const denominator = totalRevenue + totalDue;
    const collectionRate = denominator > 0 ? Number(((totalRevenue / denominator) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRecords: totalPayments,
          paid: paidPayments,
          partial: partialPayments,
          unpaid: unpaidPayments,
        },
        financial: {
          totalRevenue,
          totalDue,
          collectionRate,
        },
        recentPayments,
        monthlyStats: formattedMonthlyStats,
      },
    });
  } catch (error) {
    return sendServerError(res, "Get payment stats error", error, "Server error while fetching payment statistics");
  }
};

// @desc    Get payment by project ID
// @route   GET /api/payments/project/:projectId
// @access  Private
export const getPaymentByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!validateObjectIdOrRespond(res, projectId, "project ID")) return;

    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    }).populate("clientId", "name email company phone");

    if (!project) {
      return sendNotFoundError(res, "Project not found or you don't have permission");
    }

    const payment = await Payment.findOne({
      projectId,
      userId: req.user.id,
    })
      .populate({
        path: "projectId",
        select: "name status budget description startDate deadline clientId",
        populate: { path: "clientId", select: "name email company phone" },
      })
      .populate("userId", "name email");

    if (!payment) {
      return sendNotFoundError(res, "No payment record found for this project", {
        data: { project, payment: null },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        project,
        payment,
      },
    });
  } catch (error) {
    return sendServerError(res, "Get payment by project error", error, "Server error while fetching project payment");
  }
};

// @desc    Add payment to existing record (increment paid amount)
// @route   POST /api/payments/:id/add-payment
// @access  Private
export const addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!validateObjectIdOrRespond(res, id, "payment ID")) return;

    const normalizedAmount = toPositiveNumberOrNull(amount);
    if (normalizedAmount === null || normalizedAmount <= 0) {
      return sendBadRequestError(res, "Please provide a valid positive amount");
    }

    const updatedPayment = await Payment.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.id,
        $expr: {
          $lte: [{ $add: ["$paidAmount", normalizedAmount] }, "$totalAmount"],
        },
      },
      [
        {
          $set: {
            paidAmount: { $add: ["$paidAmount", normalizedAmount] },
          },
        },
        {
          $set: {
            dueAmount: { $subtract: ["$totalAmount", "$paidAmount"] },
            status: {
              $switch: {
                branches: [
                  { case: { $eq: ["$paidAmount", 0] }, then: "Unpaid" },
                  { case: { $lt: ["$paidAmount", "$totalAmount"] }, then: "Partial" },
                ],
                default: "Paid",
              },
            },
          },
        },
      ],
      { new: true }
    )
      .populate({
        path: "projectId",
        select: "name status budget clientId",
        populate: { path: "clientId", select: "name email company phone" },
      })
      .populate("userId", "name email");

    if (!updatedPayment) {
      return sendBadRequestError(res, "Payment amount exceeds remaining balance");
    }

    return res.status(200).json({
      success: true,
      message: "Payment added successfully",
      data: updatedPayment,
    });
  } catch (error) {
    return sendServerError(res, "Add payment error", error, "Server error while adding payment");
  }
};

// @desc    Bulk delete payments
// @route   DELETE /api/payments/bulk
// @access  Private
export const bulkDeletePayments = async (req, res) => {
  try {
    const { paymentIds } = req.body;

    if (!validateObjectIdArrayOrRespond(res, paymentIds, "payment IDs")) return;

    const result = await Payment.deleteMany({
      _id: { $in: paymentIds },
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} payment record(s) deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    return sendServerError(res, "Bulk delete payments error", error, "Server error while bulk deleting payments");
  }
};

// @desc    Get overdue payments
// @route   GET /api/payments/overdue
// @access  Private
export const getOverduePayments = async (req, res) => {
  try {
    const today = new Date();

    const overduePayments = await Payment.find({
      userId: req.user.id,
      status: { $in: ["Unpaid", "Partial"] },
    })
      .populate({
        path: "projectId",
        select: "name deadline status clientId",
        populate: { path: "clientId", select: "name email company phone" },
      })
      .sort({ updatedAt: -1 });

    const filtered = overduePayments.filter((payment) => {
      const deadline = payment.projectId?.deadline;
      return deadline && new Date(deadline) < today;
    });

    return res.status(200).json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (error) {
    return sendServerError(res, "Get overdue payments error", error, "Server error while fetching overdue payments");
  }
};
