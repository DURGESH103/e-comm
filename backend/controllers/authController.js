const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const generateAccessToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', {
    expiresIn: '7d',
  });

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password, role, adminKey } = req.body;

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    let userRole = 'user';
    if (role === 'admin') {
      if (!adminKey || adminKey !== process.env.ADMIN_KEY)
        return res.status(400).json({ message: 'Invalid admin key' });
      userRole = 'admin';
    }

    const user = await User.create({ name, email, password, role: userRole });
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({ success: true, token: accessToken, refreshToken, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    if (user.isBlocked)
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });

    // Update lastLogin without triggering full save hooks
    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.json({ success: true, token: accessToken, refreshToken, user: formatUser(user) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(401).json({ message: 'Refresh token required' });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
    );
    const user = await User.findById(decoded.id).select('role').lean();
    if (!user) return res.status(401).json({ message: 'User not found' });

    const accessToken = generateAccessToken(user._id, user.role);
    res.json({ success: true, token: accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, refreshToken, getProfile };
