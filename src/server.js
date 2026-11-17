import 'dotenv/config';
import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
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

// Глобальный обработчик ошибок 
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});