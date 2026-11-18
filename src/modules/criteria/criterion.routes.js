import { Router } from 'express';
import { create, getAll, update, remove } from './criterion.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/role.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', getAll);
router.post('/', requireRole('ADMIN'), create);
router.patch('/:id', requireRole('ADMIN'), update);
router.delete('/:id', requireRole('ADMIN'), remove);

export default router;
