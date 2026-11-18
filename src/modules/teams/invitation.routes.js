import { Router } from 'express';
import { acceptInvitation } from './team.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

router.use(authenticate);
router.post('/:id/accept', acceptInvitation); // POST /api/invitations/:id/accept

export default router;
