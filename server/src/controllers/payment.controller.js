import mongoose from "mongoose";
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

const toIsoDateOrNull = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};


const toProjectWithLegacyStatus = (projectDoc) => {
  const project = projectDoc?.toObject ? projectDoc.toObject() : projectDoc;

  if (!project) return null;

  return {
    ...project,
    status: project.projectStatus || project.status,
  };
};

const toPaymentRecord = (projectDoc) => {
  const project = toProjectWithLegacyStatus(projectDoc);
  if (!project) return null;

  return {
    _id: project._id,
    projectId: project,
    totalAmount: project.budget || 0,
    paidAmount: project.paidAmount || 0,
    dueAmount: project.dueAmount || 0,
    status: project.paymentStatus || "Unpaid",
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
};

const allowedSortFields = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  date: "updatedAt",
  totalAmount: "budget",
  paidAmount: "paidAmount",
  dueAmount: "dueAmount",
  status: "paymentStatus",
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
      query.paymentStatus = status;
    }

    if (projectId) {
      if (!validateObjectIdOrRespond(res, projectId, "project ID")) return;
      query._id = projectId;
    }

    if (clientId) {
      if (!validateObjectIdOrRespond(res, clientId, "client ID")) return;
      query.clientId = clientId;
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
      query.budget = {};
      if (normalizedMinAmount !== null) query.budget.$gte = normalizedMinAmount;
      if (normalizedMaxAmount !== null) query.budget.$lte = normalizedMaxAmount;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
      query.$or = [{ name: searchRegex }, { type: searchRegex }, { description: searchRegex }];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    const mappedSortField = allowedSortFields[sortBy] || "createdAt";
    sort[mappedSortField] = sortOrder === "desc" ? -1 : 1;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("clientId", "name email phone"),
      Project.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: projects.map(toPaymentRecord),
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

    const project = await Project.findOne({
      _id: id,
      userId: req.user.id,
    }).populate("clientId", "name email phone address");

    if (!project) {
      return sendNotFoundError(res, "Payment record not found");
    }

    return res.status(200).json({
      success: true,
      data: toPaymentRecord(project),
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

    const project = await Project.findOne({
      _id: id,
      userId: req.user.id,
    }).populate("clientId", "name email phone");

    if (!project) {
      return sendNotFoundError(res, "Payment record not found");
    }

    if (totalAmount !== undefined) {
      const normalizedTotalAmount = toPositiveNumberOrNull(totalAmount);
      if (normalizedTotalAmount === null) {
        return sendBadRequestError(res, "Total amount must be a non-negative number");
      }

      if ((project.paidAmount || 0) > normalizedTotalAmount) {
        return sendBadRequestError(res, "Total amount cannot be less than already paid amount");
      }

      project.budget = normalizedTotalAmount;
    }

    if (paidAmount !== undefined) {
      const normalizedPaidAmount = toPositiveNumberOrNull(paidAmount);
      if (normalizedPaidAmount === null) {
        return sendBadRequestError(res, "Paid amount must be a non-negative number");
      }

      const targetBudget = project.budget || 0;
      if (normalizedPaidAmount > targetBudget) {
        return sendBadRequestError(res, "Paid amount cannot exceed total amount");
      }

      if (normalizedPaidAmount < (project.paidAmount || 0)) {
        return sendBadRequestError(res, "Paid amount cannot be reduced through this endpoint");
      }

      const adjustment = normalizedPaidAmount - (project.paidAmount || 0);
      if (adjustment > 0) {
        project.payments.push({
          amount: adjustment,
          date: new Date(),
          note: "Adjustment from payment update",
        });
      }
    }

    await project.save();

    return res.status(200).json({
      success: true,
      data: toPaymentRecord(project),
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

    const project = await Project.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!project) {
      return sendNotFoundError(res, "Payment record not found");
    }

    project.payments = [];
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Payment record deleted successfully",
      data: { id: project._id },
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
      recentProjects,
      monthlyStats,
    ] = await Promise.all([
      Project.countDocuments({ userId: req.user.id }),
      Project.countDocuments({ userId: req.user.id, paymentStatus: "Paid" }),
      Project.countDocuments({ userId: req.user.id, paymentStatus: "Partial" }),
      Project.countDocuments({ userId: req.user.id, paymentStatus: "Unpaid" }),
      Project.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, total: { $sum: "$paidAmount" } } },
      ]),
      Project.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, total: { $sum: "$dueAmount" } } },
      ]),
      Project.find({ userId: req.user.id })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("clientId", "name")
        .select("name clientId budget paidAmount dueAmount paymentStatus updatedAt projectStatus"),
      Project.aggregate([
        { $match: { userId: userObjectId } },
        { $unwind: "$payments" },
        {
          $group: {
            _id: {
              year: { $year: "$payments.date" },
              month: { $month: "$payments.date" },
            },
            totalAmount: { $sum: "$payments.amount" },
            paidAmount: { $sum: "$payments.amount" },
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
      dueAmount: 0,
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
        recentPayments: recentProjects.map(toPaymentRecord),
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
    }).populate("clientId", "name email phone");

    if (!project) {
      return sendNotFoundError(res, "Project not found or you don't have permission");
    }

    return res.status(200).json({
      success: true,
      data: {
        project: toProjectWithLegacyStatus(project),
        payment: toPaymentRecord(project),
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

    const project = await Project.findOne({
      _id: id,
      userId: req.user.id,
    }).populate("clientId", "name email phone");

    if (!project) {
      return sendNotFoundError(res, "Payment record not found or you don't have permission");
    }

    if (normalizedAmount > (project.dueAmount || 0)) {
      return sendBadRequestError(res, "Payment amount exceeds remaining balance");
    }

    project.payments.push({
      amount: normalizedAmount,
      date: new Date(),
      note: "Payment added from add-payment endpoint",
    });

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Payment added successfully",
      data: toPaymentRecord(project),
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

    const projects = await Project.find({
      _id: { $in: paymentIds },
      userId: req.user.id,
    });

    await Promise.all(
      projects.map(async (project) => {
        project.payments = [];
        await project.save();
      })
    );

    return res.status(200).json({
      success: true,
      message: `${projects.length} payment record(s) deleted successfully`,
      data: {
        deletedCount: projects.length,
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

    const projects = await Project.find({
      userId: req.user.id,
      paymentStatus: { $in: ["Unpaid", "Partial"] },
      deadline: { $lt: today },
    })
      .populate("clientId", "name email phone")
      .sort({ deadline: 1 });

    return res.status(200).json({
      success: true,
      data: projects.map(toPaymentRecord),
      count: projects.length,
    });
  } catch (error) {
    return sendServerError(res, "Get overdue payments error", error, "Server error while fetching overdue payments");
  }
};

// @desc    Get payment transaction history by project
// @route   GET /api/payments/project/:projectId/transactions
// @access  Private
export const getPaymentTransactionsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!validateObjectIdOrRespond(res, projectId, "project ID")) return;

    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    }).select("payments");

    if (!project) {
      return sendNotFoundError(res, "Project not found or you don't have permission");
    }

    const transactions = [...(project.payments || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((item, index) => ({
        _id: `${projectId}-${index}-${new Date(item.date).getTime()}`,
        amount: item.amount,
        date: item.date,
        note: item.note || "",
        createdAt: item.date,
      }));

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    return sendServerError(
      res,
      "Get payment transactions by project error",
      error,
      "Server error while fetching project payment transactions"
    );
  }
};

// @desc    Add payment transaction to project
// @route   POST /api/payments/project/:projectId/transactions
// @access  Private
export const addPaymentTransaction = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { amount, date, note = "" } = req.body;

    if (!validateObjectIdOrRespond(res, projectId, "project ID")) return;

    const normalizedAmount = toPositiveNumberOrNull(amount);
    if (normalizedAmount === null || normalizedAmount <= 0) {
      return sendBadRequestError(res, "Amount must be a valid positive number");
    }

    const normalizedDate = toIsoDateOrNull(date);
    if (date && !normalizedDate) {
      return sendBadRequestError(res, "Date must be valid");
    }

    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });

    if (!project) {
      return sendNotFoundError(res, "Project not found or you don't have permission");
    }
    console.log("Current due amount:", project.dueAmount);
    console.log("Attempting to add payment amount:", normalizedAmount);

    if (normalizedAmount > (project.dueAmount || 0)) {
      return sendBadRequestError(res, "Payment amount exceeds remaining balance for this project");
    }

    const paymentDate = normalizedDate || new Date();

    project.payments.push({
      amount: normalizedAmount,
      date: paymentDate,
      note,
    });

    await project.save();

    const transactionIndex = project.payments.length - 1;

    return res.status(201).json({
      success: true,
      message: "Payment transaction recorded successfully",
      data: {
        _id: `${projectId}-${transactionIndex}-${paymentDate.getTime()}`,
        amount: normalizedAmount,
        date: paymentDate,
        note,
        createdAt: paymentDate,
      },
    });
  } catch (error) {
    return sendServerError(
      res,
      "Add payment transaction error",
      error,
      "Server error while recording payment transaction"
    );
  }
};

// @desc    Update payment transaction  
// @route   PUT /api/payments/project/:projectId/transactions/:transactionId
// @access  Private
export const updatePaymentTransaction = async (req, res) => {
  try {
    const { projectId, transactionId } = req.params;
    const { amount, date, note } = req.body;

    if (!validateObjectIdOrRespond(res, projectId, "project ID")) return;

    const normalizedAmount = toPositiveNumberOrNull(amount);
    if (normalizedAmount === null || normalizedAmount <= 0) {
      return sendBadRequestError(res, "Amount must be a valid positive number");
    }

    const normalizedDate = toIsoDateOrNull(date);
    if (date && !normalizedDate) {
      return sendBadRequestError(res, "Date must be valid");
    }

    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });

    if (!project) {
      return sendNotFoundError(res, "Project not found or you don't have permission");
    }

    const payment = project.payments.find((item) => item._id === transactionId);
    if (!payment) {
      return sendNotFoundError(res, "Payment transaction not found or you don't have permission");
    }

    if (normalizedAmount > (project.dueAmount || 0)) {
      return sendBadRequestError(res, "Payment amount exceeds remaining balance for this project");
    }

    payment.amount = normalizedAmount;
    payment.date = normalizedDate || payment.date;
    payment.note = note;

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Payment transaction updated successfully",
      data: {
        _id: transactionId,
        amount: normalizedAmount,
        date: normalizedDate || payment.date,
        note,
        createdAt: payment.date,
      },
    });
  } catch (error) {
    return sendServerError(
      res,
      "Update payment transaction error",
      error,
      "Server error while updating payment transaction"
    );
  }
};

// @desc    Delete payment transaction
// @route   DELETE /api/payments/project/:projectId/transactions/:transactionId
// @access  Private
export const deletePaymentTransaction = async (req, res) => {
  try {
    const { projectId, transactionId } = req.params;

    if (!validateObjectIdOrRespond(res, projectId, "project ID")) return;

    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });

    if (!project) {
      return sendNotFoundError(res, "Project not found or you don't have permission");
    }

    const payment = project.payments.find((item) => item._id === transactionId);
    if (!payment) {
      return sendNotFoundError(res, "Payment transaction not found or you don't have permission");
    }

    project.payments = project.payments.filter((item) => item._id !== transactionId);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Payment transaction deleted successfully",
      data: { id: transactionId },
    });
  } catch (error) {
    return sendServerError(
      res,
      "Delete payment transaction error",
      error,
      "Server error while deleting payment transaction"
    );
  }
};