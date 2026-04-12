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

// 🔥 Auto-calc logic
paymentSchema.pre("save", function (next) {
  this.dueAmount = this.totalAmount - this.paidAmount;

  if (this.paidAmount === 0) {
    this.status = "Unpaid";
  } else if (this.paidAmount < this.totalAmount) {
    this.status = "Partial";
  } else {
    this.status = "Paid";
  }

  next();
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;