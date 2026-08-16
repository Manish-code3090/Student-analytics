import express from "express";
import { createCenter, getCenter } from "../controllers/centerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// NOTE: who is allowed to hit createCenter (any logged-in user vs. platform-level
// admin only) is still an open question — currently unrestricted for the basic setup.
router.post("/", protect, createCenter);
router.get("/:id", protect, getCenter);

export default router;
