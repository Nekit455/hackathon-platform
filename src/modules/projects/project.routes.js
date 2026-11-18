import { Router } from 'express';
import { create, getById, update } from './project.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Создание проекта для команды
router.post('/', create); // POST /api/teams/:teamId/project

// Работа с конкретным проектом
router.get('/:id', getById);    // GET /api/projects/:id
router.patch('/:id', update);   // PATCH /api/projects/:id

export default router;
