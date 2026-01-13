const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  finalPrice: {
    type: Number
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['Clothing', 'Electronics', 'Books', 'Home', 'Sports', 'Beauty', 'Toys'],
    trim: true
  },
  subCategory: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(value) {
        if (this.category === 'Clothing') {
          return ['Men', 'Women', 'Kids'].includes(value);
        }
        if (this.category === 'Electronics') {
          return ['Mobile', 'Laptop', 'Audio'].includes(value);
        }
        if (this.category === 'Books') {
          return ['Fiction', 'Non-Fiction', 'Educational'].includes(value);
        }
        if (this.category === 'Home') {
          return ['Kitchen', 'Furniture', 'Decor'].includes(value);
        }
        if (this.category === 'Sports') {
          return ['Fitness', 'Outdoor', 'Team Sports'].includes(value);
        }
        if (this.category === 'Beauty') {
          return ['Skincare', 'Makeup', 'Haircare'].includes(value);
        }
        if (this.category === 'Toys') {
          return ['Educational', 'Action', 'Board Games'].includes(value);
        }
        return false;
      },
      message: 'Invalid subCategory for the selected category'
    }
  },
  tags: [{
    type: String,
    enum: ['hot', 'trending', 'offer', 'new', 'bestseller']
  }],
  brand: {
    type: String,
    required: true,
    trim: true
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate finalPrice and enforce clothing rules
productSchema.pre('save', function(next) {
  this.finalPrice = this.price - (this.price * this.discount / 100);
  
  // Enforce clothing category rules
  if (this.category === 'Clothing') {
    if (!['Men', 'Women', 'Kids'].includes(this.subCategory)) {
      return next(new Error('Invalid subCategory for Clothing. Must be Men, Women, or Kids'));
    }
  }
  
  // Normalize category and subCategory values
  if (this.category) {
    this.category = this.category.charAt(0).toUpperCase() + this.category.slice(1).toLowerCase();
  }
  if (this.subCategory) {
    this.subCategory = this.subCategory.charAt(0).toUpperCase() + this.subCategory.slice(1).toLowerCase();
  }
  
  next();
});

// Pre-update middleware
productSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  if (update.category === 'Clothing' && update.subCategory) {
    if (!['Men', 'Women', 'Kids'].includes(update.subCategory)) {
      return next(new Error('Invalid subCategory for Clothing. Must be Men, Women, or Kids'));
    }
  }
  
  next();
});

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ tags: 1 });

module.exports = mongoose.model('Product', productSchema);