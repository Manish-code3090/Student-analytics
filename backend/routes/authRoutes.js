import express from "express";
import { register, login, selectMembership } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/select-membership", protect, selectMembership);

export default router;
