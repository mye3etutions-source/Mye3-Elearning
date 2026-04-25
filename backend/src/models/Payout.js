const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  totalSessions: { type: Number, default: 0 },
  totalHours: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  paymentMode: { type: String, enum: ['Online', 'Cash'] },
  transactionId: { type: String },
  proofImage: { type: String },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
