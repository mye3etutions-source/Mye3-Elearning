const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['Parent', 'Parents', 'Student', 'Teacher', 'Other'],
      default: 'Student',
    },
    subject: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Unread', 'Read', 'Resolved'],
      default: 'Unread',
    },
    source: {
      type: String,
      enum: ['Contact Page', 'Connect Panel'],
      default: 'Contact Page',
    }
  },
  {
    timestamps: true,
  }
);

const Inquiry = mongoose.model('Inquiry', inquirySchema);
module.exports = Inquiry;
