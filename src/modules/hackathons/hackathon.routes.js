import { Router } from 'express';
import { create, getAll, getById, update } from './hackathon.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/role.js';

const router = Router();

router.use(authenticate); // все маршруты требуют авторизации

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', requireRole('ADMIN'), create);
router.patch('/:id', requireRole('ADMIN'), update);

export default router;
