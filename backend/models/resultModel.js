import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    studentMembership: { type: mongoose.Schema.Types.ObjectId, ref: "Membership", required: true },
    marksObtained: { type: Number, required: true },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

// One result per student per test
resultSchema.index({ test: 1, studentMembership: 1 }, { unique: true });

export default mongoose.model("Result", resultSchema);
