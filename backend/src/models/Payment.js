const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['created', 'captured', 'failed'], default: 'created' },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  subscriptionDetails: {
    type: { type: String, enum: ['bundle', 'subject'], required: true },
    referenceIds: [{ type: mongoose.Schema.Types.ObjectId }],
    selectedDuration: { type: String, default: 'oneMonth' },
    names: [String] // Store names to fulfill subscriptionSchema requirements
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
