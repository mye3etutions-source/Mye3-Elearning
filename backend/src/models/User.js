const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const subscriptionSchema = new mongoose.Schema({
  type: { type: String, enum: ['bundle', 'subject', 'oneonone'], required: true },
  referenceId: { type: String, required: true }, // Refers to Class or Subject (Flexible for Mock/Real)
  name: { type: String, required: true }, // e.g. "Class 10 Bundle" or "Physics Class 11"
  subscriptionType: {
    type: String,
    enum: ['full', 'single', 'oneMonth', 'threeMonths', 'sixMonths', 'twelveMonths'],
    default: 'full'
  },
  expiryDate: { type: Date, required: true },
  board: { type: String }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: [true, 'Please add an email'], 
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  mobileNumber: { type: String },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Admin', 'Teacher', 'Student', 'admin', 'teacher', 'student'],
    default: 'Student',
    lowercase: true
  },
  board: { type: String, enum: ['CBSE', 'ICSE', 'TS Board', 'AP Board', '1-ON-1', '1-on-1'] },
  className:  { type: String },
  isOneOnOne: { type: Boolean, default: false },
  oneOnOneCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'OneOnOneCategory', default: null },
  activeSubscriptions: [subscriptionSchema],
  assignedSubjects: [
    {
      assignmentType: { type: String, enum: ['bundle', 'subject'], default: 'bundle' },
      classLevel: { type: String, required: true },
      subjectName: { type: String, required: true },
      subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      board: { type: String, enum: ['CBSE', 'ICSE', 'TS Board', 'AP Board', '1-ON-1', '1-on-1'] },
      pricePerClass: { type: Number, default: 0 }
    }
  ],
  currentDeviceToken: { type: String, default: null }, // for single device login
  oneOnOneRate: { type: Number, default: 0 },            // Teacher's 1-on-1 personal session rate
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time to 10 minutes
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
