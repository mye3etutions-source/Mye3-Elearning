const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startTime:   { type: Date, required: true },
  endTime:     { type: Date, required: true },
  meetingLink: { type: String, required: true }, // Admin adds when assigning
  platform:    { type: String, enum: ['Zoom', 'Google Meet', 'Teams'], default: 'Google Meet' },
  status:      { type: String, enum: ['upcoming', 'completed', 'missed'], default: 'upcoming' }
}, { _id: true });

const personalSessionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Admin assigns later

  // Session details (admin fills when assigning)
  subjectName: { type: String, default: '' },
  scheduledSlots: [slotSchema], // All sessions in this plan

  // Subscription plan type — same as existing pricing pattern
  planType: {
    type: String,
    enum: ['oneMonth', 'threeMonths', 'sixMonths', 'twelveMonths'],
    default: null
  },
  price: { type: Number, default: 0 }, // Total plan price set by admin

  // Status flow: pending → assigned → active → completed / cancelled
  status: {
    type: String,
    enum: ['pending', 'assigned', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Payment
  paymentStatus:     { type: String, enum: ['pending', 'paid'], default: 'pending' },
  razorpayOrderId:   { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },

  // Payroll
  payoutStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  payoutId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Payout', default: null },

  // Notes
  adminNote:   { type: String, default: '' },
  teacherNote: { type: String, default: '' }

}, { timestamps: true });

module.exports = mongoose.model('PersonalSession', personalSessionSchema);
