const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  fullName:    { type: String, required: true, trim: true },
  phone:       { type: String, required: true, trim: true },
  houseNumber: { type: String, required: true, trim: true },
  street:      { type: String, required: true, trim: true },
  city:        { type: String, required: true, trim: true },
  state:       { type: String, required: true, trim: true },
  pincode:     { type: String, required: true, trim: true },
  country:     { type: String, default: 'India', trim: true },
  latitude:    { type: Number, default: null },
  longitude:   { type: Number, default: null },
  isDefault:   { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
