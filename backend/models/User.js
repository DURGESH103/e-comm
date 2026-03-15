const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  addresses: [{
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false }
  }],
  isBlocked: {
    type: Boolean,
    default: false,
    index: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1, createdAt: -1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);