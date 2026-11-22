import { Router } from 'express';
import { create, getAll, update, remove } from './criterion.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/role.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

/**
 * @swagger
 * /api/hackathons/{hackathonId}/criteria:
 *   get:
 *     summary: Получить список критериев хакатона
 *     tags: [Criteria]
 *     parameters:
 *       - in: path
 *         name: hackathonId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID хакатона
 *     responses:
 *       200:
 *         description: Список критериев успешно получен
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Хакатон не найден
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/hackathons/{hackathonId}/criteria:
 *   post:
 *     summary: Создать критерий оценки для хакатона
 *     tags: [Criteria]
 *     parameters:
 *       - in: path
 *         name: hackathonId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID хакатона
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, maxScore]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Качество реализации
 *               maxScore:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *     responses:
 *       201:
 *         description: Критерий успешно создан
 *       400:
 *         description: Ошибка валидации данных
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав, требуется роль ADMIN
 *       404:
 *         description: Хакатон не найден
 */
router.post('/', requireRole('ADMIN'), create);

/**
 * @swagger
 * /api/hackathons/{hackathonId}/criteria/{id}:
 *   patch:
 *     summary: Изменить критерий оценки
 *     tags: [Criteria]
 *     parameters:
 *       - in: path
 *         name: hackathonId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID хакатона
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID критерия
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Качество и полнота реализации
 *               maxScore:
 *                 type: integer
 *                 minimum: 1
 *                 example: 15
 *     responses:
 *       200:
 *         description: Критерий успешно обновлён
 *       400:
 *         description: Ошибка валидации данных
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав, требуется роль ADMIN
 *       404:
 *         description: Критерий не найден
 */
router.patch('/:id', requireRole('ADMIN'), update);

/**
 * @swagger
 * /api/hackathons/{hackathonId}/criteria/{id}:
 *   delete:
 *     summary: Удалить критерий оценки
 *     tags: [Criteria]
 *     parameters:
 *       - in: path
 *         name: hackathonId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID хакатона
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID критерия
 *     responses:
 *       204:
 *         description: Критерий успешно удалён
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав, требуется роль ADMIN
 *       404:
 *         description: Критерий не найден
 */
router.delete('/:id', requireRole('ADMIN'), remove);

export default router;
