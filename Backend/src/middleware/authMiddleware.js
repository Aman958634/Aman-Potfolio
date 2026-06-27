import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'Access token required' }); // No token

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired access token' }); // Invalid token
    req.user = user;
    next();
  });
};
