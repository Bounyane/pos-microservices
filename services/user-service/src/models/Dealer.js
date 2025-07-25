const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  dealerType: {
    type: String,
    enum: ['individual', 'company'],
    required: [true, 'Dealer type is required']
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  companyRegistrationNumber: {
    type: String,
    required: function() {
      return this.dealerType === 'company';
    },
    trim: true
  },
  businessAddress: {
    street: {
      type: String,
      required: [true, 'Adress is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    }
  },
  businessPhone: {
    type: String,
    trim: true,
    default: null,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  businessEmail: {
    type: String,
    default: null,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  businessDescription: {
    type: String,
    trim: true,
    default: null,
    maxlength: [500, 'Business description cannot exceed 500 characters']
  },
  businessLogo: {
    type: String,
    default: null
  },
  businessImages: [{
    type: String
  }],
  specialties: [{
    type: String,
    trim: true
  }],
  serviceAreas: [{
    city: {
      type: String,
      default: null,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'MR'
    }
  }],
  yearsInBusiness: {
    type: Number,
    min: [0, 'Years in business cannot be negative'],
    max: [100, 'Years in business cannot exceed 100'],
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date,
    default: null
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
dealerSchema.index({ dealerType: 1 });
dealerSchema.index({ 'businessAddress.city': 1 });
dealerSchema.index({ isVerified: 1 });
dealerSchema.index({ 'rating.average': -1 });

// Virtual for full business address
dealerSchema.virtual('fullBusinessAddress').get(function() {
  const addr = this.businessAddress;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Virtual for display name
dealerSchema.virtual('displayName').get(function() {
  return this.dealerType === 'company' ? this.companyName : 'Individual Dealer';
});

// Method to get public profile
dealerSchema.methods.getPublicProfile = function() {
  const dealerObject = this.toObject();
  delete dealerObject.__v;
  return dealerObject;
};

// Method to update rating
dealerSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

// Static method to find by dealer type
dealerSchema.statics.findByDealerType = function(dealerType) {
  return this.find({ dealerType }).populate('userId', 'firstName lastName email phone');
};

// Static method to find verified dealers
dealerSchema.statics.findVerified = function() {
  return this.find({ isVerified: true }).populate('userId', 'firstName lastName email phone');
};

// Static method to find top rated dealers
dealerSchema.statics.findTopRated = function(limit = 10) {
  return this.find({ isVerified: true })
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName email phone');
};

module.exports = mongoose.model('Dealer', dealerSchema); 