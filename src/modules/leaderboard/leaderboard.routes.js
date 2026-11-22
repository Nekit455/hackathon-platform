import { Router } from 'express';
import { getLeaderboardHandler } from './leaderboard.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

/**
 * @swagger
 * /api/hackathons/{hackathonId}/leaderboard:
 *   get:
 *     summary: Получить турнирную таблицу хакатона
 *     description: |
 *       Возвращает рейтинг проектов хакатона с итоговыми баллами
 *       и оценками по критериям.
 *       Турнирная таблица доступна только после завершения хакатона.
 *       Проекты отсортированы по итоговой сумме баллов.
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: path
 *         name: hackathonId
 *         required: true
 *         description: UUID хакатона
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Турнирная таблица успешно получена
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
 *                     leaderboard:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           project:
 *                             type: object
 *                             description: Информация о проекте
 *                           totalScore:
 *                             type: number
 *                             description: Итоговая сумма баллов проекта
 *                             example: 42
 *                           criteria:
 *                             type: array
 *                             description: Оценки проекта по критериям
 *                             items:
 *                               type: object
 *                               properties:
 *                                 criterion:
 *                                   type: string
 *                                   description: Название критерия
 *                                   example: Инновационность
 *                                 score:
 *                                   type: number
 *                                   description: Балл по критерию
 *                                   example: 9
 *       401:
 *         description: Не авторизован — отсутствует или недействителен JWT-токен
 *       403:
 *         description: Турнирная таблица ещё недоступна — хакатон не завершен
 *       404:
 *         description: Хакатон не найден
 */
router.get('/', getLeaderboardHandler); // GET /api/hackathons/:hackathonId/leaderboard

export default router;
