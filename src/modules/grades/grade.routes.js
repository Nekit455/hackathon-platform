import { Router } from 'express';
import { create, getByProject } from './grade.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/role.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', requireRole('JUDGE', 'ADMIN'), create); // POST /api/projects/:projectId/grades
router.get('/', requireRole('JUDGE', 'ADMIN'), getByProject); // GET /api/projects/:projectId/grades

export default router;
