import { registerSchema, loginSchema } from './auth.schema.js';
import { registerUser, loginUser } from './auth.service.js';

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data);
    res.status(201).json({ status: 'success', data: { user } });
  } catch (error) {
    if (error.name === 'ZodError') {
      error.status = 400;
      error.message = error.issues.map(e => e.message).join(', ');
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
    res.json({ status: 'success', data: result });
  } catch (error) {
    if (error.name === 'ZodError') {
      error.status = 400;
      error.message = error.issues.map(e => e.message).join(', ');
    }
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // req.user уже установлен middleware authenticate
    res.json({ status: 'success', data: { user: req.user } });
  } catch (error) {
    next(error);
  }
};