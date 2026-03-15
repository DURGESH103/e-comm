const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Lightweight auth — decodes JWT without a DB round-trip.
 * req.user is populated with { id, role } from the token payload.
 * Use `requireFullUser` after this when you need the full user document.
 */
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Fetches the full user document from DB.
 * Use only on routes that genuinely need user profile data.
 */
const requireFullUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

const userAuth = (req, res, next) => {
  if (req.user?.role === 'user') return next();
  res.status(403).json({ message: 'User access required' });
};

module.exports = { auth, adminAuth, userAuth, requireFullUser };
