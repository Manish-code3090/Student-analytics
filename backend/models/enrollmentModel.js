import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  membership: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership",
    required: true
  },

  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true
  },

  status: {
    type: String,
    enum: ["active", "completed", "dropped"],
    default: "active"
  },

  enrolledAt: {
    type: Date,
    default: Date.now
  },

  endedAt: {
    type: Date
  }
}, { timestamps: true });

enrollmentSchema.index({ membership: 1, batch: 1 }, { unique: true }); // no duplicate enrollment

export default mongoose.model("Enrollment", enrollmentSchema);