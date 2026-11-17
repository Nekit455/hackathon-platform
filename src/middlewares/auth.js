import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Authorization header missing or invalid');
      error.status = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      const error = new Error('User not found');
      error.status = 401;
      throw error;
    }

    // Прикрепляем пользователя к запросу для дальнейшего использования
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error.status = 401;
    }
    next(error);
  }
};