export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Authentication required');
      error.status = 401;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error('Forbidden: insufficient permissions');
      error.status = 403;
      return next(error);
    }

    next();
  };
};
