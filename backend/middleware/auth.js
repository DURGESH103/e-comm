const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    req.userRole = decoded.role; // Add role from JWT
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

const userAuth = (req, res, next) => {
  if (req.userRole === 'user') {
    next();
  } else {
    res.status(403).json({ message: 'User access required' });
  }
};

module.exports = { auth, adminAuth, userAuth };