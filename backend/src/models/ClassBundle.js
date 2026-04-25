const mongoose = require('mongoose');

const classBundleSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    trim: true
  },
  board: {
    type: String,
    enum: ['CBSE', 'ICSE', 'TS Board', 'AP Board'],
    required: true,
    default: 'TS Board'
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  pricing: {
    oneMonth: { type: Number, default: 0 },
    threeMonths: { type: Number, default: 0 },
    sixMonths: { type: Number, default: 0 },
    twelveMonths: { type: Number, default: 0 }
  },
  subjects: [
    {
      name: { type: String, required: true },
      singleSubjectPrice: { type: Number, default: 0 }
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Allow same class for different boards - compound unique index
classBundleSchema.index({ className: 1, board: 1 }, { unique: true });

module.exports = mongoose.model('ClassBundle', classBundleSchema);
