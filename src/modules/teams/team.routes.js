import { Router } from 'express';
import { create, getAll, getById, invite } from './team.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', create);       // POST /api/hackathons/:hackathonId/teams
router.get('/', getAll);        // GET /api/hackathons/:hackathonId/teams
router.get('/:id', getById);    // GET /api/teams/:id
router.post('/:id/invitations', invite); // POST /api/teams/:id/invitations

export default router;