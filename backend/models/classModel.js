import mongoose from "mongoose";

// A Class sits under a Batch (e.g. "Physics - Batch A"). Supports co-teaching
// via an array of teacher memberships, and multi-class enrollment via studentMemberships.
const classSchema = new mongoose.Schema(
  {
    center: { type: mongoose.Schema.Types.ObjectId, ref: "Center", required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    name: { type: String, required: true, trim: true }, // e.g. "Physics"
    teacherMemberships: [{ type: mongoose.Schema.Types.ObjectId, ref: "Membership" }],
    studentMemberships: [{ type: mongoose.Schema.Types.ObjectId, ref: "Membership" }],
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);
