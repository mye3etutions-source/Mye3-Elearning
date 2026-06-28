const mongoose = require('mongoose');

/**
 * OneOnOneCategory — Admin manages what 1-on-1 class types are available
 * e.g. Music, Art, Dance, Class 6, Class 7, Class 10, Degree...
 * Each category has its own pricing per plan type.
 */
const oneOnOneCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  pricing: {
    oneMonth:     { type: Number, default: 0 },
    threeMonths:  { type: Number, default: 0 },
    sixMonths:    { type: Number, default: 0 },
    twelveMonths: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('OneOnOneCategory', oneOnOneCategorySchema);
