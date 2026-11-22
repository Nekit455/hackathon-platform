import { Router } from 'express';
import { create, getByProject } from './grade.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/role.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

/**
 * @swagger
 * /api/projects/{projectId}/grades:
 *   post:
 *     summary: Выставить оценку проекту
 *     description: |
 *       Выставляет оценку проекту по определенному критерию.
 *       Доступно судьям и администраторам, однако пользователь
 *       должен быть назначен судьей соответствующего хакатона.
 *       Оценивание возможно только во время хакатона со статусом ONGOING.
 *       Повторная оценка тем же судьей по тому же критерию запрещена.
 *       Балл не должен превышать максимальное значение критерия.
 *     tags: [Grades]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: UUID проекта
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - criterionId
 *               - score
 *             properties:
 *               criterionId:
 *                 type: string
 *                 format: uuid
 *                 description: ID критерия оценки
 *               score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Выставленный балл, не превышающий максимум критерия
 *                 example: 8
 *     responses:
 *       201:
 *         description: Оценка успешно выставлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     grade:
 *                       type: object
 *                       description: Созданная оценка с информацией о критерии и судье
 *       400:
 *         description: Ошибка валидации, хакатон не находится в статусе ONGOING, критерий не относится к хакатону или балл превышает максимум
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Пользователь не назначен судьей данного хакатона
 *       404:
 *         description: Проект или критерий не найден
 *       409:
 *         description: Судья уже оценил проект по этому критерию
 */
router.post('/', requireRole('JUDGE', 'ADMIN'), create); // POST /api/projects/:projectId/grades

/**
 * @swagger
 * /api/projects/{projectId}/grades:
 *   get:
 *     summary: Получить оценки проекта
 *     description: |
 *       Возвращает оценки проекта.
 *       До завершения хакатона судья видит только собственные оценки,
 *       а администратор — все оценки.
 *       После завершения хакатона все оценки доступны судьям и администраторам.
 *     tags: [Grades]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: UUID проекта
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Оценки проекта успешно получены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     grades:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Оценка проекта по критерию
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Оценки еще недоступны для просмотра
 *       404:
 *         description: Проект не найден
 */
router.get('/', requireRole('JUDGE', 'ADMIN'), getByProject); // GET /api/projects/:projectId/grades

export default router;
