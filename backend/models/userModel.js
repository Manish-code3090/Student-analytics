import mongoose from "mongoose";

// User = pure identity. Role/permissions live on Membership, not here.
// This is what lets one person be a teacher at Center A and a student at Center B.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String }, // used for teacher/admin login (email or phone based)
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
