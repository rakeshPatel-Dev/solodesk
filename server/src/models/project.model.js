// models/Project.js
import mongoose from "mongoose";

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
    type: {
      type: String,
      trim: true,
    },
    budget: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Lead", "In Progress", "Completed"],
      default: "Lead",
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startDate: Date,
    deadline: Date,
  },
  { timestamps: true }
);

// Compound index for filtering
projectSchema.index({ clientId: 1, status: 1 });
const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);

export default Project;