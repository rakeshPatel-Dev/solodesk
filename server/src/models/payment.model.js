// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Unpaid", "Partial", "Paid"],
      default: "Unpaid",
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    }
  },
  { timestamps: true }
);

// Auto-calc derived fields before persisting.
paymentSchema.pre("save", function () {
  this.dueAmount = this.totalAmount - this.paidAmount;

  if (this.paidAmount === 0) {
    this.status = "Unpaid";
  } else if (this.paidAmount < this.totalAmount) {
    this.status = "Partial";
  } else {
    this.status = "Paid";
  }
});

// Enforce one payment record per project per user at DB level.
paymentSchema.index({ projectId: 1, userId: 1 }, { unique: true });

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;