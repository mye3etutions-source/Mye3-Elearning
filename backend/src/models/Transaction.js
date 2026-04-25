const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'cancelled', 'pending'],
    default: 'pending'
  },
  packageName: {
    type: String, // e.g., 'Class 10 Bundle' or 'Physics (Class 12)'
    required: true
  },
  referenceId: {
    type: String, // Subject ID or Bundle ID
    required: true
  },
  type: {
    type: String,
    enum: ['bundle', 'subject'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
