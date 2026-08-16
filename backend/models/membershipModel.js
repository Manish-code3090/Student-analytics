import mongoose from "mongoose";

// The core of the multi-tenant design: one row per (user, center, role).
// A user can hold multiple Memberships -> multiple roles across multiple centers.
const membershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    center: { type: mongoose.Schema.Types.ObjectId, ref: "Center", required: true },
    role: { type: String, enum: { values: ["admin", "teacher", "student"], default: "student" }, required: true },
    phone: { type: String, required: true },
    // Student-only fields
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },
    status: { type: String, enum: ["active", "inactive", "pending"], default: "active" },
  },
  { timestamps: true }
);

// A user should only hold one membership per (center, role) combo
membershipSchema.index({ user: 1, center: 1 }, { unique: true });
// No need for a unique index on rollNumber since it's not used for lookups
membershipSchema.index({ center: 1 }, { unique: true, sparse: true });

export default mongoose.model("Membership", membershipSchema);
