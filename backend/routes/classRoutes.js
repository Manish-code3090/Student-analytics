import express from "express";
import Class from "../models/Class.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET /api/classes?batch=<id>
router.get("/", protect, async (req, res) => {
  const filter = { center: req.user.centerId };
  if (req.query.batch) filter.batch = req.query.batch;
  const classes = await Class.find(filter);
  res.json(classes);
});

// POST /api/classes  -> supports co-teaching via teacherMemberships array
router.post("/", protect, requireRole("admin", "teacher"), async (req, res) => {
  const { name, batch, teacherMemberships } = req.body;
  const newClass = await Class.create({
    center: req.user.centerId,
    batch,
    name,
    teacherMemberships: teacherMemberships || [req.user.membershipId],
  });
  res.status(201).json(newClass);
});

export default router;
