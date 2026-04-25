const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Live', 'Recorded'], required: true },
  platform: { type: String, enum: ['Zoom', 'Meet', 'YouTube'], required: true },
  videoId: { type: String }, // For YouTube unlisted
  notesUrl: { type: String }, // Cloudinary/S3 PDF link
  meetingLink: { type: String }, // For Zoom/Meet
  startTime: { type: Date }, // For live sessions
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, // If it belongs to 6-10
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' } // If it belongs to 11-12
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
