const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  assignmentId: {
    type: String, // Can be classLevel or subjectId
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveSession',
    default: null
  },
  board: {
    type: String,
    enum: ['CBSE', 'ICSE', 'TS Board', 'AP Board'],
    default: 'TS Board'
  },
  classLevel: {
    type: String,
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String, // PDF or Document URL (Cloudinary/S3)
    required: true
  },
  type: {
    type: String,
    enum: ['notes', 'worksheet', 'assignment', 'other'],
    default: 'notes'
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
