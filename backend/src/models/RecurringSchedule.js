const mongoose = require('mongoose');

const recurringScheduleSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  classLevel: { type: String, required: true },
  subjectName: { type: String, required: true },
  board: { type: String, enum: ['CBSE', 'ICSE', 'TS Board', 'AP Board'], default: 'TS Board' },
  title: { type: String, required: true },
  platform: { type: String, enum: ['Zoom', 'Google Meet', 'YouTube Live'], required: true },
  link: { type: String, required: true },
  
  // Specific for recurring rule
  recurrenceType: { type: String, enum: ['daily'], default: 'daily' },
  startHour: { type: Number, required: true }, // hour (0-23)
  startMinute: { type: Number, required: true }, // minute (0-59)
  durationMinutes: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('RecurringSchedule', recurringScheduleSchema);
