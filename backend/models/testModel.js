import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    center: { type: mongoose.Schema.Types.ObjectId, ref: "Center", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    maxMarks: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Membership" }, // teacher membership
  },
  { timestamps: true }
);

export default mongoose.model("Test", testSchema);
