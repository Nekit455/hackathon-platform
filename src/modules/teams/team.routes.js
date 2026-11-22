import { Router } from 'express';
import { create, getAll, getById, invite } from './team.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

/**
 * @swagger
 * /api/hackathons/{hackathonId}/teams:
 *   post:
 *     summary: Создать команду в хакатоне
 *     tags: [Teams]
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Команда разработчиков
 *     responses:
 *       201:
 *         description: Команда успешно создана. Создатель автоматически становится капитаном
 *       400:
 *         description: Ошибка валидации данных
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Хакатон не найден
 *       409:
 *         description: Пользователь уже является капитаном команды этого хакатона
 */
router.post('/', create);       // POST /api/hackathons/:hackathonId/teams

/**
 * @swagger
 * /api/hackathons/{hackathonId}/teams:
 *   get:
 *     summary: Получить список команд хакатона
 *     tags: [Teams]
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
 *         description: Список команд успешно получен
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Хакатон не найден
 */
router.get('/', getAll);        // GET /api/hackathons/:hackathonId/teams

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Получить команду по ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID команды
 *     responses:
 *       200:
 *         description: Данные команды успешно получены
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Команда не найдена
 */
router.get('/:id', getById);    // GET /api/teams/:id

/**
 * @swagger
 * /api/teams/{id}/invitations:
 *   post:
 *     summary: Пригласить пользователя в команду
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID команды
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: participant@example.com
 *     responses:
 *       201:
 *         description: Приглашение успешно создано
 *       400:
 *         description: Некорректный email
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Приглашать участников может только капитан команды
 *       404:
 *         description: Команда или пользователь не найдены
 *       409:
 *         description: Пользователь уже состоит в команде или приглашен в нее
 */
router.post('/:id/invitations', invite); // POST /api/teams/:id/invitations

export default router;