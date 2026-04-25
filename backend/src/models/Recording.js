const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classLevel: { type: String, required: true },
  subjectName: { type: String, required: true },
  title: { type: String, required: true },
  youtubeId: { type: String, required: true } // YouTube Video ID
}, { timestamps: true });

module.exports = mongoose.model('Recording', recordingSchema);
