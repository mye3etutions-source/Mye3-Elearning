const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  classLevel: { type: String, required: true },
  subjectName: { type: String, required: true },
  board: { type: String, enum: ['CBSE', 'ICSE', 'TS Board', 'AP Board'], default: 'TS Board' },
  title: { type: String, required: true },
  platform: { type: String, enum: ['Zoom', 'Google Meet', 'YouTube Live'], required: true },
  link: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['upcoming', 'live', 'ended', 'missed'], default: 'upcoming' },
  recurringScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecurringSchedule' },
  payoutStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  payoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payout' }
}, { timestamps: true });

module.exports = mongoose.model('LiveSession', liveSessionSchema);
