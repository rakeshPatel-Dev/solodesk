import mongoose from "mongoose";
import Client from "./client.model.js";

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      trim: true,
    },

    // 🔥 TOTAL PROJECT VALUE
    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    // 🔥 SOURCE OF TRUTH (PAYMENT HISTORY)
    payments: [paymentSchema],

    // 🔥 DERIVED FIELDS (DO NOT EDIT MANUALLY)
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partial", "Paid"],
      default: "Unpaid",
      index: true,
    },

    projectStatus: {
      type: String,
      enum: ["Lead", "In Progress", "Completed"],
      default: "Lead",
      index: true,
    },

    startDate: Date,
    deadline: Date,
  },
  { timestamps: true }
);


// 🔥 AUTO CALCULATIONS (CORE LOGIC)
projectSchema.pre("save", async function () {
  // Store the previous paid amount before recalculation (handles fetched documents)
  if (!this._previousPaidAmount) {
    this._previousPaidAmount = this.paidAmount || 0;
  }

  // calculate total paid from history
  this.paidAmount = this.payments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  // update client's total spend
  if (this.isModified("paidAmount") || this.isModified("clientId")) {
    await Client.findByIdAndUpdate(
      this.clientId,
      {
        $inc: { amountSpend: this.paidAmount - (this._previousPaidAmount || 0) },
      },
      { new: true }
    ).exec();
    this._previousPaidAmount = this.paidAmount; // store for next change
  }
  // calculate due
  const total = this.budget || 0;
  this.dueAmount = Math.max(total - this.paidAmount, 0);

  // update payment status
  if (this.paidAmount === 0) {
    this.paymentStatus = "Unpaid";
  } else if (this.paidAmount < total) {
    this.paymentStatus = "Partial";
  } else {
    this.paymentStatus = "Paid";
  }
});


// 🔥 INDEXES (FOR PERFORMANCE)
projectSchema.index({ userId: 1, clientId: 1 });
projectSchema.index({ paymentStatus: 1, projectStatus: 1 });

const Project =
  mongoose.models.Project ||
  mongoose.model("Project", projectSchema);

export default Project;