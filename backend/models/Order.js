const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Online'],
      default: 'COD',
    },
    // Automatic audit trail — every status change is recorded
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for user order listing (most common query)
orderSchema.index({ user: 1, createdAt: -1 });

// Auto-append to statusHistory whenever status changes
orderSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update?.status) {
    this.updateOne({}, {
      $push: {
        statusHistory: { status: update.status, timestamp: new Date() },
      },
    });
  }
});

// Seed initial statusHistory on creation
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory = [{ status: this.status, timestamp: new Date() }];
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
