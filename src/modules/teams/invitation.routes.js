import { Router } from 'express';
import { acceptInvitation } from './team.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/invitations/{id}/accept:
 *   post:
 *     summary: Принять приглашение в команду
 *     description: |
 *       Принимает приглашение текущего пользователя в команду.
 *       Идентификатор id — это ID записи участника (Member),
 *       созданной при отправке приглашения.
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID приглашения (записи Member)
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Приглашение успешно принято
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
 *                     member:
 *                       type: object
 *                       description: Данные участника команды
 *       401:
 *         description: Не авторизован — отсутствует или недействителен JWT-токен
 *       403:
 *         description: Приглашение адресовано другому пользователю
 *       404:
 *         description: Приглашение не найдено
 *       409:
 *         description: Приглашение уже было принято
 */
router.post('/:id/accept', acceptInvitation); // POST /api/invitations/:id/accept

export default router;
