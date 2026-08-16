import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Membership from "../models/membershipModel.js";

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const register = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: "Phone already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, email, passwordHash });
   const memberships = await Membership.updateMany(
  {
    phone,
    status: "pending"
  },
  {
    $set: {
      user: user?._id,
      status: "active"
    }
  }
);
    res.status(201).json({ id: user._id, name: user.name, phone: user.phone });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !user.passwordHash) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const memberships = await Membership.find({ user: user._id, status: "active" })
      .populate("center", "name code")
      .select("role center batch rollNumber");

    const identityToken = signToken({ id: user._id, phone: user.phone, stage: "identity" });
    res.json({ identityToken, user: { id: user._id, name: user.name }, memberships });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const selectMembership = async (req, res) => {
  try {
    const { membershipId } = req.body;
    const membership = await Membership.findById(membershipId).populate("center", "name code");
    if (!membership || membership.status !== "active") return res.status(404).json({ message: "Membership not found" });

    const token = signToken({
      id: req.user?.id,
      membershipId: membership._id,
      centerId: membership.center._id,
      role: membership.role,
    });

    res.json({ token, activeCenter: membership.center, role: membership.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
