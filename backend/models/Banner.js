const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    url: {
      type: String,
      required: [true, 'Banner image is required']
    },
    alt: {
      type: String,
      default: ''
    }
  },
  link: {
    url: {
      type: String,
      trim: true
    },
    text: {
      type: String,
      trim: true,
      maxlength: [50, 'Link text cannot exceed 50 characters']
    },
    openInNewTab: {
      type: Boolean,
      default: false
    }
  },
  position: {
    type: String,
    enum: ['hero', 'sidebar', 'footer', 'popup', 'category'],
    required: [true, 'Banner position is required']
  },
  priority: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  targetAudience: {
    type: String,
    enum: ['all', 'customers', 'merchants', 'new-users'],
    default: 'all'
  },
  clickCount: {
    type: Number,
    default: 0
  },
  impressionCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bannerSchema.index({ position: 1 });
bannerSchema.index({ isActive: 1 });
bannerSchema.index({ priority: -1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

// Virtual to check if banner is currently active
bannerSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  const isWithinDateRange = (!this.startDate || this.startDate <= now) && 
                           (!this.endDate || this.endDate >= now);
  return this.isActive && isWithinDateRange;
});

// Method to increment click count
bannerSchema.methods.incrementClick = function() {
  this.clickCount += 1;
  return this.save();
};

// Method to increment impression count
bannerSchema.methods.incrementImpression = function() {
  this.impressionCount += 1;
  return this.save();
};

// Static method to get active banners by position
bannerSchema.statics.getActiveBannersByPosition = function(position, targetAudience = 'all') {
  const now = new Date();
  return this.find({
    position,
    isActive: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: { $lte: now } }
    ],
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: now } }
    ],
    $or: [
      { targetAudience: 'all' },
      { targetAudience }
    ]
  }).sort({ priority: -1, createdAt: -1 });
};

module.exports = mongoose.model('Banner', bannerSchema);
