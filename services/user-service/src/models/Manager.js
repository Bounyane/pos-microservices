const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  storeType: {
    type: String,
    enum: ['restaurant', 'supermarket', 'cafe', 'bakery', 'pharmacy', 'clothing', 'electronics', 'other'],
    required: [true, 'Store type is required']
  },
  storeName: {
    type: String,
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters'],
    default: null
  },
  storeAddress: {
    street: {
      type: String,
      trim: true,
      default: null
      
    },
    city: {
      type: String,
      trim: true,
      default: null
    },
    state: {
      type: String,
      trim: true,
      default: null
    },
    zipCode: {
      type: String,
      trim: true,
      default: null
    },
    country: {
      type: String,
      trim: true,
      default: 'MOROCCO'
    }
  },
  storePhone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'],
    default: null
  },
  storeEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: null,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  storeDescription: {
    type: String,
    trim: true,
    default: null,
    maxlength: [500, 'Store description cannot exceed 500 characters']
  },
  storeLogo: {
    type: String,
    default: null
  },
  storeImages: [{
    type: String
  }],
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
managerSchema.index({ storeType: 1 });
managerSchema.index({ 'storeAddress.city': 1 });
managerSchema.index({ isVerified: 1 });

// Virtual for full address
managerSchema.virtual('fullAddress').get(function() {
  const addr = this.storeAddress;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Method to get public profile
managerSchema.methods.getPublicProfile = function() {
  const managerObject = this.toObject();
  delete managerObject.__v;
  return managerObject;
};

// Static method to find by store type
managerSchema.statics.findByStoreType = function(storeType) {
  return this.find({ storeType }).populate('userId', 'firstName lastName email phone');
};

// Static method to find verified managers
managerSchema.statics.findVerified = function() {
  return this.find({ isVerified: true }).populate('userId', 'firstName lastName email phone');
};

module.exports = mongoose.model('Manager', managerSchema); 