import 'dotenv/config';
import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import hackathonRoutes from './modules/hackathons/hackathon.routes.js';
import criterionRoutes from './modules/criteria/criterion.routes.js';
import teamRoutes from './modules/teams/team.routes.js';
import invitationRoutes from './modules/teams/invitation.routes.js';
import projectRoutes from './modules/projects/project.routes.js';
import gradeRoutes from './modules/grades/grade.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Корневой маршрут для проверки живости
app.get('/', (req, res) => {
  res.json({ message: 'Hackathon Platform API', docs: '/docs' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Подключаем модули API
app.use('/api/auth', authRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/hackathons/:hackathonId/criteria', criterionRoutes);
app.use('/api/hackathons/:hackathonId/teams', teamRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/teams/:teamId/project', projectRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/grades', gradeRoutes);
app.use('/api/invitations', invitationRoutes);

// Глобальный обработчик ошибок 
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});