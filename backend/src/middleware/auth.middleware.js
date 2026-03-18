const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Neautorizat. Token lipsă.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Utilizatorul nu există sau este dezactivat.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirat.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Token invalid.' });
  }
};

// Middleware pentru verificare rol
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Acces interzis. Necesită rolul: ${roles.join(' sau ')}.`,
      });
    }
    next();
  };
};

module.exports = { protect, requireRole };
