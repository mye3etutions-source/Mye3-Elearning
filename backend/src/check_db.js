const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: '../.env' }); // or whichever path

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const teachers = await User.find({ role: { $in: ['Teacher', 'teacher', 'admin', 'Admin'] } }).select('name role');
  console.log(teachers);
  mongoose.disconnect();
}
check().catch(console.error);
