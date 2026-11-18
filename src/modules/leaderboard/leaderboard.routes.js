import { Router } from 'express';
import { getLeaderboardHandler } from './leaderboard.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.get('/', getLeaderboardHandler); // GET /api/hackathons/:hackathonId/leaderboard

export default router;
