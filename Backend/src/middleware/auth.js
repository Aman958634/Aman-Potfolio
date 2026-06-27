import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Access denied'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  return res.status(500).json({
    message: err.message || 'Internal server error'
  });
};
