const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const User = require('../backend/src/models/User');
const ClassBundle = require('../backend/src/models/ClassBundle');
const Subject = require('../backend/src/models/Subject');

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const bundles = await ClassBundle.find({}).limit(5);
    console.log('Bundles boards:', bundles.map(b => b.board));

    const subjects = await Subject.find({}).limit(5);
    console.log('Subjects boards:', subjects.map(s => s.board));

    const teachers = await User.find({ role: 'teacher' }).limit(5);
    console.log('Teachers assignedSubjects count:', teachers.map(t => t.assignedSubjects.length));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkData();
