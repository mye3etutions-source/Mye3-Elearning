const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const subscriptionSchema = new mongoose.Schema({
  type: { type: String, enum: ['bundle', 'subject'], required: true },
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
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Admin', 'Teacher', 'Student', 'admin', 'teacher', 'student'],
    default: 'Student',
    lowercase: true
  },
  board: { type: String, enum: ['CBSE', 'ICSE', 'TS Board', 'AP Board', '1-on-1'] },
  className: { type: String },
  activeSubscriptions: [subscriptionSchema],
  assignedSubjects: [
    {
      assignmentType: { type: String, enum: ['bundle', 'subject'], default: 'bundle' },
      classLevel: { type: String, required: true },
      subjectName: { type: String, required: true },
      subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      board: { type: String, enum: ['CBSE', 'ICSE', 'TS Board', 'AP Board', '1-on-1'] },
      pricePerClass: { type: Number, default: 0 }
    }
  ],
  currentDeviceToken: { type: String, default: null }, // for single device login
  oneOnOneRate: { type: Number, default: 0 }            // Teacher's 1-on-1 personal session rate
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

module.exports = mongoose.model('User', userSchema);
