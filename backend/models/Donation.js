const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodItem: {
    type: String,
    required: true,
    trim: true
  },
  foodType: {
    type: String,
    enum: ['Veg', 'Non-Veg', 'Canned', 'Cooked', 'Packaged', 'Raw', 'Snacks', 'Drinks', 'Other'],
    default: 'Veg'
  },
  quantity: {
    type: String,
    required: true
  },
  packaging: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  preparedAt: {
    type: Date,
    required: true
  },
  availableFrom: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  pickupStartTime: {
    type: String,
    trim: true
  },
  pickupEndTime: {
    type: String,
    trim: true
  },
  servings: {
    type: String,
    trim: true
  },
  // contactNumber: {
  //   type: String,
  //   match: /^\d{10}$/
  // },
  storageInstructions: {
    type: String,
    trim: true
  },
  specialNotes: {
    type: String,
    trim: true
  },
  isRefrigerated: {
    type: Boolean,
    default: false
  },

 coordinates: {
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
},

  ngoRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    default: null
  },
  ngoDetails: {
    type: Object,
    default: null
  },
  donorDetails: {
    type: Object,
    default: null
  },
  status: {
    type: String,
    enum: ['Available', 'Picked', 'Delivered', 'Confirmed','Accepted'],
    default: 'Available'
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  pickedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// donationSchema.index({ coordinates: '2dsphere' });

donationSchema.index({ donor: 1 });    
donationSchema.index({ volunteer: 1 });   

donationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Donation', donationSchema);
