
import { Router } from 'express';
import { create, getAll, getById, update, assignJudge } from './hackathon.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/role.js';

const router = Router();

router.use(authenticate); // все маршруты требуют авторизации

/**
 * @swagger
 * /api/hackathons:
 *   get:
 *     summary: Получить список всех хакатонов
 *     tags: [Hackathons]
 *     responses:
 *       200:
 *         description: Список хакатонов успешно получен
 *       401:
 *         description: Не авторизован
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/hackathons/{id}:
 *   get:
 *     summary: Получить информацию о хакатоне
 *     tags: [Hackathons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Идентификатор хакатона
 *     responses:
 *       200:
 *         description: Информация о хакатоне успешно получена
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Хакатон не найден
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/hackathons:
 *   post:
 *     summary: Создать новый хакатон
 *     tags: [Hackathons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, theme, startDate, endDate]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 example: Summer Hackathon 2026
 *               theme:
 *                 type: string
 *                 minLength: 3
 *                 example: Искусственный интеллект
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-07-01T09:00:00.000Z'
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-07-03T18:00:00.000Z'
 *     responses:
 *       201:
 *         description: Хакатон успешно создан
 *       400:
 *         description: Ошибка валидации данных
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав. Требуется роль ADMIN
 */
router.post('/', requireRole('ADMIN'), create);

/**
 * @swagger
 * /api/hackathons/{id}:
 *   patch:
 *     summary: Обновить информацию о хакатоне
 *     tags: [Hackathons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Идентификатор хакатона
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 example: Summer Hackathon 2026
 *               theme:
 *                 type: string
 *                 minLength: 3
 *                 example: Искусственный интеллект
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-07-01T09:00:00.000Z'
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-07-03T18:00:00.000Z'
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ONGOING, FINISHED]
 *                 example: PUBLISHED
 *     responses:
 *       200:
 *         description: Информация о хакатоне успешно обновлена
 *       400:
 *         description: Ошибка валидации данных
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав. Требуется роль ADMIN
 *       404:
 *         description: Хакатон не найден
 */
router.patch('/:id', requireRole('ADMIN'), update);

router.post('/:id/judges', requireRole('ADMIN'), assignJudge); // POST /api/hackathons/:id/judges

export default router;
