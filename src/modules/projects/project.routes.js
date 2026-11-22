import { Router } from 'express';
import { create, getById, update } from './project.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

/**
 * @swagger
 * /api/teams/{teamId}/project:
 *   post:
 *     summary: Создать проект команды
 *     description: |
 *       Создает проект для команды.
 *       Создать проект может только капитан команды.
 *       В команде должно быть не менее двух принятых участников.
 *       Для одной команды допускается только один проект.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         description: UUID команды
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, repoUrl]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 example: Умная система мониторинга
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: Веб-приложение для мониторинга показателей окружающей среды.
 *               repoUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://github.com/team/project
 *     responses:
 *       201:
 *         description: Проект успешно создан
 *       400:
 *         description: Ошибка валидации или в команде недостаточно участников
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Создать проект может только капитан команды
 *       404:
 *         description: Команда не найдена
 *       409:
 *         description: Для команды уже создан проект
 */
// Создание проекта для команды
router.post('/', create); // POST /api/teams/:teamId/project

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Получить проект по ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID проекта
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Данные проекта успешно получены
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Проект не найден
 */
// Работа с конкретным проектом
router.get('/:id', getById);    // GET /api/projects/:id

/**
 * @swagger
 * /api/projects/{id}:
 *   patch:
 *     summary: Обновить проект
 *     description: Обновлять проект может только капитан соответствующей команды.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 example: Обновлённое название проекта
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: Обновлённое описание проекта.
 *               repoUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://github.com/team/new-project
 *     responses:
 *       200:
 *         description: Проект успешно обновлен
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Обновлять проект может только капитан команды
 *       404:
 *         description: Проект не найден
 */
router.patch('/:id', update);   // PATCH /api/projects/:id

export default router;
