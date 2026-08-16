const Membership = require('../models/Membership');
const Batch = require('../models/Batch');

/**
 * req.auth = { membershipId, centerId, role } — attached by JWT middleware.
 *
 * createMembership already handles "add a student directly into a batch."
 * This controller only covers what happens AFTER that: moving a student to
 * a different batch, taking them out of one, and reading batch rosters —
 * things a one-time create step can't do.
 */

const STAFF_ROLES = ['admin', 'teacher'];

async function assertBatchInCallerCenter(batchId, centerId) {
  const batch = await Batch.findById(batchId);
  if (!batch) {
    const err = new Error('Batch not found');
    err.status = 404;
    throw err;
  }
  if (String(batch.center) !== String(centerId)) {
    const err = new Error('Batch does not belong to your center');
    err.status = 403;
    throw err;
  }
  return batch;
}

/**
 * PATCH /memberships/:membershipId/batch
 * body: { batchId }
 * Move a student into a batch, or to a different one. Staff-only.
 */
exports.assignBatch = async (req, res, next) => {
  try {
    const { role, centerId } = req.auth;
    if (!STAFF_ROLES.includes(role)) {
      return res.status(403).json({ message: 'Not authorized to assign a batch' });
    }

    const { membershipId } = req.params;
    const { batchId } = req.body;
    if (!batchId) {
      return res.status(400).json({ message: 'batchId is required' });
    }

    const membership = await Membership.findById(membershipId);
    if (!membership || String(membership.center) !== String(centerId)) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    if (membership.role !== 'student') {
      return res.status(400).json({ message: 'Only student memberships can be assigned a batch' });
    }

    await assertBatchInCallerCenter(batchId, centerId);

    membership.batch = batchId;
    if (membership.status === 'pending') {
      membership.status = 'active';
    }
    await membership.save();

    return res.status(200).json(membership);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /memberships/:membershipId/batch
 * Take a student out of their batch without deleting the membership
 * (e.g. paused mid-term, staying in the center). Staff-only.
 */
exports.unassignBatch = async (req, res, next) => {
  try {
    const { role, centerId } = req.auth;
    if (!STAFF_ROLES.includes(role)) {
      return res.status(403).json({ message: 'Not authorized to remove a batch assignment' });
    }

    const membership = await Membership.findById(req.params.membershipId);
    if (!membership || String(membership.center) !== String(centerId)) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    membership.batch = undefined;
    await membership.save();

    return res.status(200).json(membership);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /batches/:batchId/students?status=active
 * Roster for a batch. Staff-only.
 */
exports.listStudentsInBatch = async (req, res, next) => {
  try {
    const { role, centerId } = req.auth;
    if (!STAFF_ROLES.includes(role)) {
      return res.status(403).json({ message: 'Not authorized to view batch roster' });
    }

    const { batchId } = req.params;
    const { status = 'active' } = req.query;

    await assertBatchInCallerCenter(batchId, centerId);

    const students = await Membership.find({
      batch: batchId,
      role: 'student',
      status,
    })
      .populate('user', 'name phone email')
      .sort({ createdAt: 1 });

    return res.status(200).json(students);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /memberships/:membershipId/batch
 * A student's current batch. Self, or staff in the same center.
 */
exports.getStudentBatch = async (req, res, next) => {
  try {
    const { role, centerId, membershipId: callerMembershipId } = req.auth;
    const { membershipId } = req.params;

    const isSelf = String(membershipId) === String(callerMembershipId);
    if (!isSelf && !STAFF_ROLES.includes(role)) {
      return res.status(403).json({ message: 'Not authorized to view this batch assignment' });
    }

    const membership = await Membership.findById(membershipId).populate('batch');
    if (!membership || String(membership.center) !== String(centerId)) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    return res.status(200).json({ batch: membership.batch || null, status: membership.status });
  } catch (err) {
    next(err);
  }
};