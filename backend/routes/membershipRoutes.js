import express from 'express';
const router = express.Router();
import { createMembership, listMemberships, getMembershipById, updateMembership, deleteMembership } from '../controllers/membershipController.js';
import {protect,} from '../middleware/auth.js';

router.use(protect);

router.post('/memberships', createMembership);
router.get('/memberships', listMemberships);
router.get('/memberships/:id', getMembershipById);
router.patch('/memberships/:id', updateMembership);
router.delete('/memberships/:id', deleteMembership);

module.exports = router;