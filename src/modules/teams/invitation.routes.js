import { Router } from 'express';
import { acceptInvitation, listMyInvitations } from './team.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/invitations/{id}/accept:
 *   post:
 *     summary: Принять приглашение в команду
 *     tags: [Invitations]
 *     description: |
 *       Принимает приглашение текущего пользователя в команду.
 *       Идентификатор id — это ID записи участника (Member),
 *       созданной при отправке приглашения.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID приглашения (Member)
 *     responses:
 *       200:
 *         description: Приглашение принято
 *       403:
 *         description: Приглашение предназначено другому пользователю
 *       404:
 *         description: Приглашение не найдено
 *       409:
 *         description: Приглашение уже принято
 */
router.post('/:id/accept', acceptInvitation); // POST /api/invitations/:id/accept

/**
 * @swagger
 * /api/invitations:
 *   get:
 *     summary: Получить список входящих приглашений текущего пользователя
 *     tags: [Invitations]
 *     responses:
 *       200:
 *         description: Список приглашений
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     invitations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           team:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *       401:
 *         description: Не авторизован
 */
router.get('/', listMyInvitations); // GET /api/invitations

export default router;
