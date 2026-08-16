import mongoose from "mongoose";

// Batches organize students within a center (e.g. "2026 Batch", "Morning Batch")
const batchSchema = new mongoose.Schema(
  {
    center: { type: mongoose.Schema.Types.ObjectId, ref: "Center", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    timing: { type: String, trim: true }, // e.g. "Mon-Fri 9am-12pm"
  },
  { timestamps: true }
);

export default mongoose.model("Batch", batchSchema);
