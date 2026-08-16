import Membership from "../models/membership.js";
import Batch from "../models/batch.js";
import User from "../models/user.js";

/**
 * req.auth = { membershipId, centerId, role } — attached by JWT middleware,
 * scoped to the center the caller selected at login.
 */

async function assertBatchInCenter(batchId, centerId) {
  const batch = await Batch.findById(batchId);
  if (!batch) {
    const err = new Error("Batch not found");
    err.status = 404;
    throw err;
  }
  if (String(batch.center) !== String(centerId)) {
    const err = new Error("Batch does not belong to this center");
    err.status = 403;
    throw err;
  }
  return batch;
}

/**
 * POST /memberships
 * body: { phone, role, userId?, batch? }
 *
 * Creates a membership in the caller's center. If `batch` is provided
 * (student role only), the student is placed directly into that batch —
 * skipping the separate assignBatch step. batch is optional: omit it to
 * create a pending membership and assign a batch later.
 *
 * Admin-only.
 */
export const createMembership = async (req, res, next) => {
  try {
    const { role, centerId } = req.auth;
    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can create a membership" });
    }

    const { phone, role, userId, batch } = req.body;
    if (!phone || !role) {
      return res.status(400).json({ message: "phone and role are required" });
    }
    if (!["admin", "teacher", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (batch && role !== "student") {
      return res
        .status(400)
        .json({ message: "Only student memberships can have a batch" });
    }

    const existing = await Membership.findOne({ phone, center: centerId });
    if (existing) {
      return res
        .status(409)
        .json({
          message: "A membership already exists for this phone in this center",
        });
    }

    let user;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    let batchDoc;
    if (batch) {
      batchDoc = await assertBatchInCenter(batch, centerId);
    }

    // Active as soon as we have both an identity and (for students) a batch.
    // No user yet -> pending (invite not yet claimed). Student with no batch
    // yet -> pending too, so "assigned but not placed" stays visible in queries.
    const status =
      user && (role !== "student" || batchDoc) ? "active" : "pending";

    const membership = await Membership.create({
      user: user ? user._id : undefined,
      phone,
      center: centerId,
      role,
      batch: batchDoc ? batchDoc._id : undefined,
      status,
    });

    return res.status(201).json(membership);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({
          message: "A membership already exists for this phone in this center",
        });
    }
    next(err);
  }
};

/**
 * GET /memberships?role=student&batch=<id>&status=active  can filter by role, batch, and/or status
 * List memberships in the caller's center. Staff-only.
 */
export const listMemberships = async (req, res, next) => {
  try {
    const { role: callerRole, centerId } = req.auth;
    if (!["admin", "teacher"].includes(callerRole)) {
      return res
        .status(403)
        .json({ message: "Not authorized to view memberships" });
    }

    const filter = { center: centerId };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.batch) filter.batch = req.query.batch;
    if (req.query.status) filter.status = req.query.status;

    // need grouping based on batch
    const memberships = await Membership.find(filter)
      .populate("user", "name phone email")
      .populate("batch", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(memberships);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /memberships/:id
 * Self, or staff in the same center.
 */
export const getMembershipById = async (req, res, next) => {
  try {
    const {
      role: callerRole,
      centerId,
      membershipId: callerMembershipId,
    } = req.auth;
    const { id } = req.params;

    const isSelf = String(id) === String(callerMembershipId);
    if (!isSelf && !["admin", "teacher"].includes(callerRole)) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this membership" });
    }

    const membership = await Membership.findById(id)
      .populate("user", "name phone email")
      .populate("batch", "name");
    if (!membership || String(membership.center) !== String(centerId)) {
      return res.status(404).json({ message: "Membership not found" });
    }

    return res.status(200).json(membership);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /memberships/:id
 * body: { role?, status?, batch? }
 * Admin-only. General-purpose update — role changes, status changes,
 * and/or batch changes all go through here, same rules as assignBatch
 * (batch only valid for students, must belong to this center).
 */
export const updateMembership = async (req, res, next) => {
  try {
    const { role: callerRole, centerId } = req.auth;
    if (callerRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can update a membership" });
    }

    const membership = await Membership.findById(req.params.id);
    if (!membership || String(membership.center) !== String(centerId)) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const { role, status, batch } = req.body;

    if (role !== undefined) {
      if (!["admin", "teacher", "student"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      membership.role = role;
      if (role !== "student") membership.batch = undefined;
    }

    if (batch !== undefined) {
      if (batch === null) {
        membership.batch = undefined;
      } else {
        if (membership.role !== "student") {
          return res
            .status(400)
            .json({ message: "Only student memberships can have a batch" });
        }
        await assertBatchInCenter(batch, centerId);
        membership.batch = batch;
      }
    }

    if (status !== undefined) {
      if (!["pending", "active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      membership.status = status;
    }

    await membership.save();
    return res.status(200).json(membership);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /memberships/:id
 * Admin-only. Blocks deletion if the student has results on record —
 * deactivate instead of losing academic history.
 */
export const deleteMembership = async (req, res, next) => {
  try {
    const { role, centerId } = req.auth;
    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can delete a membership" });
    }

    const membership = await Membership.findById(req.params.id);
    if (!membership || String(membership.center) !== String(centerId)) {
      return res.status(404).json({ message: "Membership not found" });
    }

    if (membership.role === "student") {
      // Cleaner and does the exact same thing
      const { default: Result } = await import("../models/result.js");
      const resultCount = await Result.countDocuments({
        studentMembership: membership._id,
      });
      if (resultCount > 0) {
        return res.status(409).json({
          message: `Cannot delete: ${resultCount} result(s) exist for this student. Set status to 'inactive' instead.`,
        });
      }
    }

    await membership.deleteOne();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
